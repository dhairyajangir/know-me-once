const crypto = require("crypto");
const net = require("net");
const path = require("path");
const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});

const PORT = toPositiveInt(process.env.PORT, 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = toPositiveInt(process.env.REQUEST_TIMEOUT_MS, 12000);
const MODEL_TIMEOUT_MS = toPositiveInt(process.env.MODEL_TIMEOUT_MS, 18000);
const MAX_REMOTE_TEXT_BYTES = toPositiveInt(process.env.MAX_REMOTE_TEXT_BYTES, 3 * 1024 * 1024);
const MAX_REMOTE_TEXT_CHARS = toPositiveInt(process.env.MAX_REMOTE_TEXT_CHARS, 220000);
const MAX_MODEL_TEXT_CHARS = toPositiveInt(process.env.MAX_MODEL_TEXT_CHARS, 45000);
const RATE_LIMIT_WINDOW_MS = toPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60 * 1000);
const RATE_LIMIT_MAX = toPositiveInt(process.env.RATE_LIMIT_MAX, 50);
const EXTRACTION_CACHE_TTL_MS = toPositiveInt(process.env.EXTRACTION_CACHE_TTL_MS, 10 * 60 * 1000);
const PORTFOLIO_CACHE_TTL_MS = toPositiveInt(process.env.PORTFOLIO_CACHE_TTL_MS, 10 * 60 * 1000);
const PIPELINE_HEURISTIC_WEIGHT = clampWeight(process.env.PIPELINE_HEURISTIC_WEIGHT, 1.15);
const PIPELINE_MODEL_WEIGHT = clampWeight(process.env.PIPELINE_MODEL_WEIGHT, 1);

const PROFILE_TEMPLATE = {
  identity: {
    preferredName: "",
    fullName: "",
    background: "",
    location: "",
    dateOfBirth: "",
    languages: [],
    contact: {
      email: "",
      phone: "",
    },
    socials: {
      linkedin: "",
      github: "",
      website: "",
      twitter: "",
      instagram: "",
    },
  },
  capability: {
    coreSkills: "",
    strengths: "",
    activeSkills: "",
    tools: "",
  },
  experience: {
    education: {
      program: "",
      year: "",
    },
    work: {
      currentRole: "",
      yearsExperience: "",
      recentImpact: "",
    },
    freelance: {
      services: "",
      targetClients: "",
    },
    founder: {
      venture: "",
      stage: "",
      problem: "",
      traction: "",
    },
    projects: {
      studentProjects: "",
      portfolioHighlight: "",
    },
    proudMoment: "",
    experiments: "",
  },
  intent: {
    shortTerm: "",
    longTerm: "",
    internshipGoal: "",
    nextCareerMove: "",
    growthBet: "",
    nearTermIncomeGoal: "",
  },
  behavior: {
    learningStyle: "",
    workStyle: "",
    collaborationStyle: "",
    values: "",
  },
  preferences: {
    communicationStyle: "",
    interests: "",
    curiosityAreas: "",
  },
  context: {
    currentFocus: "",
    primaryRole: "",
    teamShape: "",
    availability: "",
    blockers: "",
    constraints: "",
    supportNeeded: "",
  },
  meta: {
    profilePath: "explorer",
    depthMode: "light",
    completionRatio: 0,
    lastUpdated: "",
  },
};

const PROFILE_COMPLETION_KEYS = [
  "identity",
  "capability",
  "experience",
  "intent",
  "behavior",
  "preferences",
  "context",
];
const PROFILE_COMPLETION_TOTAL = countLeafSlots(PROFILE_TEMPLATE, PROFILE_COMPLETION_KEYS, false);

const ALLOWED_RESUME_EXTENSIONS = new Set(["pdf", "docx", "txt", "md"]);
const knownSocialHosts = ["linkedin.com", "lnkd.in", "github.com", "twitter.com", "x.com", "instagram.com"];
const SECTION_KEYS = ["general", "summary", "experience", "education", "projects", "skills", "contact", "links"];
const ROLE_HINT_REGEX =
  /\b(student|software engineer|engineer|developer|designer|analyst|manager|consultant|intern|founder|freelancer|researcher|architect|devops|product manager)\b/i;
const EDUCATION_HINT_REGEX = /\b(education|b\.?tech|bachelor|master|phd|college|university|school|diploma|degree|semester)\b/i;
const PROJECT_HINT_REGEX = /\b(project|portfolio|case study|hackathon|prototype|built|developed|implemented)\b/i;
const SKILL_CANONICAL_MAP = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  node: "Node.js",
  nodejs: "Node.js",
  react: "React",
  reactjs: "React",
  next: "Next.js",
  nextjs: "Next.js",
  express: "Express",
  expressjs: "Express",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  api: "API",
  rest: "REST",
  graphql: "GraphQL",
  ai: "AI",
  ml: "ML",
  ui: "UI",
  ux: "UX",
};

const requestBuckets = new Map();
const extractionCache = createTimedCache({ maxEntries: 250, ttlMs: EXTRACTION_CACHE_TTL_MS });
const portfolioTextCache = createTimedCache({ maxEntries: 120, ttlMs: PORTFOLIO_CACHE_TTL_MS });

let cachedGeminiModel = null;

setInterval(() => {
  pruneRateLimitBuckets();
  extractionCache.prune();
  portfolioTextCache.prune();
}, RATE_LIMIT_WINDOW_MS).unref();

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }
  return applyRateLimit(req, res, next);
});

app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: GEMINI_MODEL });
});

app.post("/api/preview/resume", upload.single("resume"), async (req, res) => {
  try {
    validateResumeUpload(req.file);

    const resumeText = await extractResumeText(req.file);
    const preview = resumeText.slice(0, 2600);

    return res.json({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      textPreview: preview,
      truncated: resumeText.length > preview.length,
    });
  } catch (error) {
    return sendApiError(res, error, "Resume preview failed.");
  }
});

app.post("/api/extract/resume", upload.single("resume"), async (req, res) => {
  const startedAt = Date.now();

  try {
    validateResumeUpload(req.file);

    const resumeText = await extractResumeText(req.file);
    if (!resumeText.trim()) {
      throw new UserFacingError("No readable text was extracted from this resume.", 400);
    }

    const result = await extractProfilePipeline({
      sourceType: "resume",
      sourceLabel: req.file.originalname,
      text: resumeText,
      portfolioUrl: "",
    });

    return res.json({
      profile: result.profile,
      source: "resume",
      model: GEMINI_MODEL,
      extractionMode: result.extractionMode,
      cached: result.cached,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return sendApiError(res, error, "Resume extraction failed.");
  }
});

app.post("/api/extract/portfolio", async (req, res) => {
  const startedAt = Date.now();

  try {
    const url = normalizeWebUrl(req.body && req.body.url);
    const portfolioText = await extractPortfolioText(url);

    if (!portfolioText.trim()) {
      throw new UserFacingError("No readable text was extracted from this portfolio.", 400);
    }

    const result = await extractProfilePipeline({
      sourceType: "portfolio",
      sourceLabel: url,
      text: portfolioText,
      portfolioUrl: url,
    });

    return res.json({
      profile: result.profile,
      source: "portfolio",
      model: GEMINI_MODEL,
      extractionMode: result.extractionMode,
      cached: result.cached,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    return sendApiError(res, error, "Portfolio extraction failed.");
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }

  // Do not serve index.html for asset-like paths.
  if (path.extname(req.path)) {
    return res.status(404).end();
  }

  return res.sendFile(path.join(__dirname, "index.html"));
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Uploaded file exceeds the 12MB limit." });
  }

  return sendApiError(res, error, "Request failed.");
});

let activeServer = null;

function startServer(port = PORT) {
  if (activeServer) {
    return activeServer;
  }

  activeServer = app.listen(port, () => {
    console.log(`Adaptive Identity app running at http://localhost:${port}`);
  });

  return activeServer;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function clampWeight(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.min(3, parsed));
}

class UserFacingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendApiError(res, error, fallbackMessage) {
  const statusCode = Number(error && error.statusCode) || 500;
  if (statusCode >= 500) {
    console.error("API error:", error && error.message ? error.message : error);
  }

  const safeMessage = statusCode >= 500 ? fallbackMessage : error.message;
  return res.status(statusCode).json({ error: safeMessage || fallbackMessage });
}

function applyRateLimit(req, res, next) {
  const now = Date.now();
  const ip = getClientIp(req);
  const bucket = requestBuckets.get(ip) || { startedAt: now, count: 0 };

  if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    bucket.startedAt = now;
    bucket.count = 0;
  }

  bucket.count += 1;
  requestBuckets.set(ip, bucket);

  if (bucket.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests. Please retry shortly.",
    });
  }

  return next();
}

function pruneRateLimitBuckets() {
  const now = Date.now();
  requestBuckets.forEach((bucket, ip) => {
    if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
      requestBuckets.delete(ip);
    }
  });
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (forwarded) {
    return forwarded;
  }
  return String(req.ip || req.socket.remoteAddress || "unknown");
}

function ensureGeminiKey() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new UserFacingError("Set GEMINI_API_KEY in .env before using AI extraction.", 503);
  }
}

function getGeminiModel() {
  if (cachedGeminiModel) {
    return cachedGeminiModel;
  }

  ensureGeminiKey();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  cachedGeminiModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  return cachedGeminiModel;
}

function validateResumeUpload(file) {
  if (!file) {
    throw new UserFacingError("Please upload a resume file first.", 400);
  }

  const extension = getFileExtension(file.originalname);
  if (!ALLOWED_RESUME_EXTENSIONS.has(extension)) {
    throw new UserFacingError("Unsupported file format. Upload PDF, DOCX, TXT, or MD.", 400);
  }
}

function normalizeWebUrl(rawUrl) {
  const cleaned = String(rawUrl || "").trim();
  if (!cleaned) {
    throw new UserFacingError("Portfolio URL is required.", 400);
  }

  const normalized = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (error) {
    throw new UserFacingError("Please provide a valid portfolio URL.", 400);
  }

  if (!/^https?:$/i.test(parsed.protocol)) {
    throw new UserFacingError("Only http/https URLs are supported.", 400);
  }

  assertPublicHostname(parsed.hostname);
  parsed.hash = "";

  return parsed.toString();
}

function assertPublicHostname(hostname) {
  const host = String(hostname || "").trim().toLowerCase();
  if (!host) {
    throw new UserFacingError("Portfolio host is invalid.", 400);
  }

  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal")
  ) {
    throw new UserFacingError("Private or local network URLs are not allowed.", 400);
  }

  const ipType = net.isIP(host);
  if (ipType && isPrivateIpAddress(host)) {
    throw new UserFacingError("Private or local network URLs are not allowed.", 400);
  }
}

function isPrivateIpAddress(address) {
  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fe80") || normalized.startsWith("fc") || normalized.startsWith("fd");
  }

  const parts = address.split(".").map((segment) => Number(segment));
  if (parts.length !== 4 || parts.some((entry) => !Number.isInteger(entry) || entry < 0 || entry > 255)) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}

async function extractResumeText(file) {
  const extension = getFileExtension(file.originalname);
  const mimeType = String(file.mimetype || "").toLowerCase();

  if (extension === "pdf" || mimeType.includes("pdf")) {
    const parsed = await pdfParse(file.buffer);
    return normalizeText(parsed.text || "");
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeText(result.value || "");
  }

  if (extension === "txt" || extension === "md" || mimeType.startsWith("text/")) {
    return normalizeText(file.buffer.toString("utf8"));
  }

  throw new UserFacingError("Unsupported file format. Upload PDF, DOCX, TXT, or MD.", 400);
}

async function extractPortfolioText(url) {
  const cached = portfolioTextCache.get(url);
  if (cached) {
    return cached;
  }

  let extracted = "";
  try {
    extracted = await fetchPortfolioDirect(url);
  } catch (error) {
    extracted = "";
  }

  if (!extracted.trim()) {
    extracted = await fetchPortfolioViaProxy(url);
  }

  portfolioTextCache.set(url, extracted);
  return extracted;
}

async function fetchPortfolioDirect(url) {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "text/html,application/json,text/plain,*/*",
      },
      redirect: "follow",
    },
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new UserFacingError(`Portfolio request failed (${response.status}).`, 400);
  }

  validateRemoteResponse(response);

  if (response.url) {
    const finalUrl = new URL(response.url);
    assertPublicHostname(finalUrl.hostname);
  }

  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    const data = await response.json();
    return normalizeText(JSON.stringify(data));
  }

  const body = clipText(await response.text(), MAX_REMOTE_TEXT_CHARS);
  if (contentType.includes("text/html") || /<html|<body|<main/i.test(body)) {
    return normalizeText(htmlToText(body));
  }

  return normalizeText(body);
}

async function fetchPortfolioViaProxy(url) {
  const target = url.replace(/^https?:\/\//i, "");
  const candidates = [`https://r.jina.ai/http://${target}`, `https://r.jina.ai/https://${target}`];

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const response = await fetchWithTimeout(
        candidate,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
          redirect: "follow",
        },
        REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        throw new Error(`Proxy returned ${response.status}`);
      }

      validateRemoteResponse(response);
      const text = normalizeText(clipText(await response.text(), MAX_REMOTE_TEXT_CHARS));
      if (text) {
        return text;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw new UserFacingError(
    lastError ? `Portfolio fetch failed. ${lastError.message}` : "Portfolio fetch failed.",
    400
  );
}

function validateRemoteResponse(response) {
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REMOTE_TEXT_BYTES) {
    throw new UserFacingError("Portfolio page is too large to parse safely.", 413);
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new UserFacingError("Request timed out while reading source content.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function htmlToText(html) {
  const $ = cheerio.load(String(html || ""));
  $("script, style, noscript, svg, canvas").remove();

  const title = $("title").first().text().trim();
  const description = $("meta[name='description']").attr("content") || "";
  const headings = $("h1, h2, h3")
    .slice(0, 120)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join("\n");
  const body = $("body").text();

  return [title, description, headings, body].filter(Boolean).join("\n");
}

async function extractProfilePipeline({ sourceType, sourceLabel, text, portfolioUrl }) {
  const normalizedText = normalizeText(text);
  const signals = extractDeterministicSignals(normalizedText, portfolioUrl);
  const cacheKey = createExtractionCacheKey({ sourceType, portfolioUrl, text: normalizedText });
  const cachedResult = extractionCache.get(cacheKey);

  if (cachedResult) {
    return {
      ...cachedResult,
      cached: true,
    };
  }

  const heuristicProfile = buildHeuristicProfile({
    sourceType,
    text: normalizedText,
    portfolioUrl,
    signals,
  });

  let extractionCandidate = heuristicProfile;
  let extractionMode = "heuristic";

  try {
    const modelProfile = await extractProfileWithGemini({
      sourceType,
      sourceLabel,
      text: normalizedText,
      portfolioUrl,
      signals,
    });

    extractionCandidate = blendProfilesWithWeights({
      heuristicProfile,
      modelProfile,
      heuristicWeight: PIPELINE_HEURISTIC_WEIGHT,
      modelWeight: PIPELINE_MODEL_WEIGHT,
    });
    extractionMode = "blended";
  } catch (error) {
    extractionCandidate = heuristicProfile;
  }

  const profile = normalizeProfile(extractionCandidate, {
    sourceType,
    portfolioUrl,
    signals,
    originalText: normalizedText,
    extractionScope: true,
  });

  const result = {
    profile,
    extractionMode,
  };

  extractionCache.set(cacheKey, result);

  return {
    ...result,
    cached: false,
  };
}

function createExtractionCacheKey({ sourceType, portfolioUrl, text }) {
  return `${sourceType}|${portfolioUrl || "-"}|${hashText(text)}`;
}

function hashText(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

async function extractProfileWithGemini({ sourceType, sourceLabel, text, portfolioUrl, signals, promptSignalWeight = 1 }) {
  const model = getGeminiModel();
  const prompt = buildExtractionPrompt({ sourceType, sourceLabel, text, portfolioUrl, signals, promptSignalWeight });

  const result = await promiseWithTimeout(
    model.generateContent(prompt),
    MODEL_TIMEOUT_MS,
    "AI extraction timed out."
  );

  const output = result && result.response && typeof result.response.text === "function" ? result.response.text() : "";
  if (!output) {
    throw new Error("AI model returned empty JSON output.");
  }

  return parseJsonFromModel(output);
}

function promiseWithTimeout(promise, timeoutMs, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function buildExtractionPrompt({ sourceType, sourceLabel, text, portfolioUrl, signals, promptSignalWeight = 1 }) {
  const clippedText = prepareModelInputText(text, signals);
  const repeatCount = Math.max(1, Math.min(3, Math.round(clampWeight(promptSignalWeight, 1) * 2)));
  const repeatedSignals = Array.from({ length: repeatCount }, () => JSON.stringify(signals, null, 2)).join("\n");
  const sectionDigest = renderSectionDigestForPrompt(signals.sections);

  return [
    "You are an expert identity-profile extraction assistant.",
    `Source type: ${sourceType}`,
    `Source label: ${sourceLabel}`,
    portfolioUrl ? `Portfolio URL: ${portfolioUrl}` : "",
    "",
    "Return JSON ONLY (no markdown, no explanation) matching this exact schema:",
    JSON.stringify(PROFILE_TEMPLATE, null, 2),
    "",
    "High-confidence extracted signals from deterministic parser:",
    repeatedSignals,
    "",
    "Detected section split (heuristic parser):",
    sectionDigest || "No clear section headings detected.",
    "",
    "Strict rules:",
    "- Do not invent facts.",
    "- Keep missing fields as empty string or empty array.",
    "- Infer context.primaryRole as one of: student, professional, freelancer, founder, explorer.",
    "- Keep values concise and readable.",
    "- identity.background must be a short personal summary only. Never include emails, phones, URLs, or skills lists.",
    "- experience.education.program must only contain education details (degree/institute/year). Do not place project text here.",
    "- experience.projects.* must only contain project details and project links.",
    "- experience.work.currentRole must be a role title or role line (for example: Student, Software Engineer, Founder).",
    "- capability.coreSkills and capability.activeSkills must be skill names only (comma-separated), not headings.",
    "- Link mapping must be exact: linkedin -> identity.socials.linkedin, github -> identity.socials.github, website -> identity.socials.website, twitter/x -> identity.socials.twitter, instagram -> identity.socials.instagram.",
    "- Preserve links if they exist in source text.",
    "- This is extraction phase only: keep intent.*, behavior.*, and preferences.* empty unless explicitly stated in source text.",
    "",
    "Extract from this source text:",
    clippedText,
  ]
    .filter(Boolean)
    .join("\n");
}

function prepareModelInputText(text, signals) {
  const normalized = normalizeText(text);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const priorityLines = [];
  const priorityRegex = /(https?:\/\/|www\.|email|phone|contact|linkedin|github|twitter|instagram|portfolio|project|experience|education|skills)/i;

  for (const line of lines) {
    if (priorityRegex.test(line)) {
      priorityLines.push(line);
    }
  }

  if (signals.urls.length) {
    priorityLines.unshift(`Detected URLs: ${signals.urls.join(" | ")}`);
  }

  if (signals.emails.length) {
    priorityLines.unshift(`Detected emails: ${signals.emails.join(", ")}`);
  }

  if (signals.phones.length) {
    priorityLines.unshift(`Detected phones: ${signals.phones.join(", ")}`);
  }

  if (signals.skillTokens && signals.skillTokens.length) {
    priorityLines.unshift(`Detected skills: ${signals.skillTokens.join(", ")}`);
  }

  if (signals.sections && typeof signals.sections === "object") {
    SECTION_KEYS.forEach((sectionKey) => {
      const content = cleanString(signals.sections[sectionKey] || "");
      if (!content) return;
      const snippetLimit = sectionKey === "general" ? 320 : 220;
      priorityLines.push(`[section:${sectionKey}] ${clipText(content, snippetLimit)}`);
    });
  }

  const deduped = [];
  const seen = new Set();
  for (const line of [...priorityLines, ...lines]) {
    const key = line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(line);
    }
  }

  return deduped.join("\n").slice(0, MAX_MODEL_TEXT_CHARS);
}

function renderSectionDigestForPrompt(sections) {
  if (!sections || typeof sections !== "object") {
    return "";
  }

  return SECTION_KEYS.map((sectionKey) => {
    const value = cleanString(sections[sectionKey] || "");
    if (!value) return "";
    const maxChars = sectionKey === "general" ? 360 : 240;
    return `${sectionKey.toUpperCase()}: ${clipText(value, maxChars)}`;
  })
    .filter(Boolean)
    .join("\n");
}

function parseJsonFromModel(raw) {
  const clean = String(raw || "").trim();
  const candidates = [clean];

  const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    candidates.push(fenced[1].trim());
  }

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const block = clean.slice(firstBrace, lastBrace + 1).trim();
    candidates.push(block);
    candidates.push(block.replace(/,\s*([}\]])/g, "$1"));
  }

  for (const candidate of uniqueStrings(candidates)) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Continue through repair candidates.
    }
  }

  throw new Error("Gemini did not return valid JSON.");
}

function buildHeuristicProfile({ sourceType, text, portfolioUrl, signals }) {
  const base = deepClone(PROFILE_TEMPLATE);
  const sections = signals.sections || splitTextIntoSections(text);

  base.identity.contact.email = signals.emails[0] || "";
  base.identity.contact.phone = signals.phones[0] || "";
  base.identity.socials.linkedin = signals.socials.linkedin || "";
  base.identity.socials.github = signals.socials.github || "";
  base.identity.socials.twitter = signals.socials.twitter || "";
  base.identity.socials.instagram = signals.socials.instagram || "";
  base.identity.socials.website = signals.socials.website || portfolioUrl || "";
  base.identity.languages = [...signals.languages];

  const guessedName = guessNameFromText(text);
  if (guessedName) {
    base.identity.fullName = guessedName;
    base.identity.preferredName = guessedName.split(" ")[0] || "";
  }

  const guessedLocation = guessLocationFromText(text);
  if (guessedLocation) {
    base.identity.location = guessedLocation;
  }

  base.identity.background = deriveBackgroundSummary({ text, sections });
  base.context.currentFocus = sourceType === "resume" ? "Extracted from resume" : "Extracted from portfolio";
  base.capability.coreSkills = inferSkillSummary(text, sections);
  base.capability.activeSkills = base.capability.coreSkills;

  const sectionProjects = extractProjectSectionSummary(sections);
  const projectLinks = formatProjectLinks(signals.urls, base.identity.socials, portfolioUrl);
  const mergedProjects = uniqueStrings([sectionProjects, projectLinks].filter(Boolean)).join(" | ");
  if (mergedProjects) {
    base.experience.projects.portfolioHighlight = compactSummary(mergedProjects, 320);
    base.experience.projects.studentProjects = compactSummary(mergedProjects, 320);
  }

  const educationProgram = extractEducationProgramText({ text, sections });
  if (educationProgram) {
    base.experience.education.program = educationProgram;
  }

  const currentRole = extractCurrentRoleText({ sourceType, text, sections });
  if (currentRole) {
    base.experience.work.currentRole = currentRole;
  }

  base.context.primaryRole = classifyPathFromText(text);

  return base;
}

function normalizeProfile(candidate, { sourceType, portfolioUrl, signals, originalText, extractionScope = false }) {
  const safeSignals = signals || getEmptySignals(portfolioUrl);
  const sectionMap = safeSignals.sections || splitTextIntoSections(originalText);
  const base = deepClone(PROFILE_TEMPLATE);
  mergeKnownKeys(base, candidate || {});

  base.identity.languages = normalizeLanguages(base.identity.languages);
  if (!base.identity.languages.length && safeSignals.languages.length) {
    base.identity.languages = [...safeSignals.languages];
  }

  base.identity.contact.email = normalizeEmail(base.identity.contact.email) || safeSignals.emails[0] || "";
  base.identity.contact.phone = normalizePhone(base.identity.contact.phone) || safeSignals.phones[0] || "";

  base.identity.socials.linkedin = firstNonEmpty(
    normalizeSocialField("linkedin", base.identity.socials.linkedin),
    safeSignals.socials.linkedin
  );
  base.identity.socials.github = firstNonEmpty(
    normalizeSocialField("github", base.identity.socials.github),
    safeSignals.socials.github
  );
  base.identity.socials.twitter = firstNonEmpty(
    normalizeSocialField("twitter", base.identity.socials.twitter),
    safeSignals.socials.twitter
  );
  base.identity.socials.instagram = firstNonEmpty(
    normalizeSocialField("instagram", base.identity.socials.instagram),
    safeSignals.socials.instagram
  );
  base.identity.socials.website = firstNonEmpty(
    normalizeSocialField("website", base.identity.socials.website),
    safeSignals.socials.website,
    portfolioUrl
  );

  if (!base.identity.fullName) {
    base.identity.fullName = guessNameFromText(originalText);
  }

  if (!base.identity.preferredName && base.identity.fullName) {
    base.identity.preferredName = base.identity.fullName.split(" ")[0] || "";
  }

  if (!base.identity.location) {
    base.identity.location = guessLocationFromText(originalText);
  }

  if (!base.context.currentFocus) {
    base.context.currentFocus = sourceType === "resume" ? "Extracted from resume" : "Extracted from portfolio";
  }

  base.identity.background = normalizeBackgroundValue(base.identity.background, {
    originalText,
    sections: sectionMap,
    signals: safeSignals,
  });

  const inferredSkills = inferSkillSummary(originalText, sectionMap);
  base.capability.coreSkills = normalizeSkillSummary(firstNonEmpty(base.capability.coreSkills, inferredSkills));
  base.capability.activeSkills = normalizeSkillSummary(firstNonEmpty(base.capability.activeSkills, base.capability.coreSkills));

  base.experience.education.program = normalizeEducationProgram(base.experience.education.program, {
    originalText,
    sections: sectionMap,
  });

  base.experience.work.currentRole = normalizeCurrentRole(base.experience.work.currentRole, {
    sourceType,
    originalText,
    sections: sectionMap,
  });

  const normalizedProjectSummary = buildProjectSummary({
    existingValue: firstNonEmpty(base.experience.projects.portfolioHighlight, base.experience.projects.studentProjects),
    sections: sectionMap,
    urls: safeSignals.urls,
    socials: base.identity.socials,
    portfolioUrl,
  });

  if (!base.experience.projects.portfolioHighlight) {
    base.experience.projects.portfolioHighlight = normalizedProjectSummary;
  } else {
    base.experience.projects.portfolioHighlight = compactSummary(base.experience.projects.portfolioHighlight, 320);
  }

  if (!base.experience.projects.studentProjects) {
    base.experience.projects.studentProjects = normalizedProjectSummary;
  } else {
    base.experience.projects.studentProjects = compactSummary(base.experience.projects.studentProjects, 320);
  }

  if (extractionScope) {
    base.intent = deepClone(PROFILE_TEMPLATE.intent);
    base.behavior = deepClone(PROFILE_TEMPLATE.behavior);
    base.preferences = deepClone(PROFILE_TEMPLATE.preferences);
  }

  base.context.primaryRole = normalizePrimaryRole(base.context.primaryRole || classifyRoleFromProfile(base));
  base.meta.profilePath = base.context.primaryRole;
  base.meta.lastUpdated = new Date().toISOString();
  base.meta.depthMode = "light";
  base.meta.completionRatio = computeCompletionRatio(base);

  return base;
}

function getEmptySignals(portfolioUrl = "") {
  const website = normalizeExternalUrl(portfolioUrl);
  return {
    emails: [],
    phones: [],
    urls: website ? [website] : [],
    socials: {
      linkedin: "",
      github: "",
      website,
      twitter: "",
      instagram: "",
    },
    languages: [],
    sections: createEmptySectionMap(),
    skillTokens: [],
  };
}

function parseAndNormalizeProfileJson(rawJson) {
  let parsed;
  try {
    parsed = JSON.parse(String(rawJson || ""));
  } catch (error) {
    throw new UserFacingError("Malformed JSON edits. Please provide valid JSON.", 400);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new UserFacingError("Root value must be a JSON object.", 400);
  }

  return normalizeProfile(parsed, {
    sourceType: "resume",
    portfolioUrl: "",
    signals: getEmptySignals(""),
    originalText: "",
  });
}

async function extractProfileForHarness({
  sourceType,
  sourceLabel,
  text,
  portfolioUrl,
  includeModel = true,
  heuristicWeight = 1,
  modelWeight = 1,
  promptSignalWeight = 1,
}) {
  const safeSourceType = sourceType === "portfolio" ? "portfolio" : "resume";
  const safeLabel = cleanString(sourceLabel) || "harness-sample";
  const safePortfolioUrl = safeSourceType === "portfolio" ? normalizeExternalUrl(portfolioUrl) || "" : "";
  const normalizedText = normalizeText(text);

  const signals = extractDeterministicSignals(normalizedText, safePortfolioUrl);
  const heuristicProfile = buildHeuristicProfile({
    sourceType: safeSourceType,
    text: normalizedText,
    portfolioUrl: safePortfolioUrl,
    signals,
  });

  let modelProfile = null;
  if (includeModel) {
    try {
      modelProfile = await extractProfileWithGemini({
        sourceType: safeSourceType,
        sourceLabel: safeLabel,
        text: normalizedText,
        portfolioUrl: safePortfolioUrl,
        signals,
        promptSignalWeight,
      });
    } catch (error) {
      modelProfile = null;
    }
  }

  const blendedCandidate = blendProfilesWithWeights({
    heuristicProfile,
    modelProfile,
    heuristicWeight,
    modelWeight,
  });

  return {
    profile: normalizeProfile(blendedCandidate, {
      sourceType: safeSourceType,
      portfolioUrl: safePortfolioUrl,
      signals,
      originalText: normalizedText,
      extractionScope: true,
    }),
    extractionMode: modelProfile ? "blended" : "heuristic",
    modelAvailable: Boolean(modelProfile),
  };
}

function blendProfilesWithWeights({ heuristicProfile, modelProfile, heuristicWeight = 1, modelWeight = 1 }) {
  if (!modelProfile || typeof modelProfile !== "object") {
    return deepClone(heuristicProfile || PROFILE_TEMPLATE);
  }

  const hWeight = clampWeight(heuristicWeight, 1);
  const mWeight = clampWeight(modelWeight, 1);

  return mergeCandidateByTemplate({
    templateNode: PROFILE_TEMPLATE,
    heuristicNode: heuristicProfile || {},
    modelNode: modelProfile || {},
    pathParts: [],
    heuristicWeight: hWeight,
    modelWeight: mWeight,
  });
}

function mergeCandidateByTemplate({ templateNode, heuristicNode, modelNode, pathParts, heuristicWeight, modelWeight }) {
  if (Array.isArray(templateNode)) {
    return pickWeightedValue({
      fieldPath: pathParts.join("."),
      heuristicValue: heuristicNode,
      modelValue: modelNode,
      heuristicWeight,
      modelWeight,
    });
  }

  if (templateNode && typeof templateNode === "object") {
    const merged = {};

    Object.keys(templateNode).forEach((key) => {
      merged[key] = mergeCandidateByTemplate({
        templateNode: templateNode[key],
        heuristicNode: heuristicNode && typeof heuristicNode === "object" ? heuristicNode[key] : undefined,
        modelNode: modelNode && typeof modelNode === "object" ? modelNode[key] : undefined,
        pathParts: [...pathParts, key],
        heuristicWeight,
        modelWeight,
      });
    });

    return merged;
  }

  return pickWeightedValue({
    fieldPath: pathParts.join("."),
    heuristicValue: heuristicNode,
    modelValue: modelNode,
    heuristicWeight,
    modelWeight,
  });
}

function pickWeightedValue({ fieldPath, heuristicValue, modelValue, heuristicWeight, modelWeight }) {
  const hScore = scoreFieldValue(fieldPath, heuristicValue, "heuristic") * heuristicWeight;
  const mScore = scoreFieldValue(fieldPath, modelValue, "model") * modelWeight;

  if (mScore > hScore) {
    return deepCloneValue(modelValue);
  }

  return deepCloneValue(heuristicValue);
}

function scoreFieldValue(fieldPath, value, source) {
  if (!isMeaningfulValue(value)) {
    return 0;
  }

  let score = 1;

  if (/^identity\.contact\./.test(fieldPath) || /^identity\.socials\./.test(fieldPath)) {
    score *= source === "heuristic" ? 1.25 : 0.9;
  }

  if (/^(capability|experience|intent|behavior|preferences)\./.test(fieldPath)) {
    score *= source === "model" ? 1.15 : 0.85;
  }

  if (typeof value === "string") {
    const length = value.trim().length;
    if (length < 3) score *= 0.75;
    if (length > 140 && /^identity\.socials\./.test(fieldPath)) score *= 0.6;
  }

  if (Array.isArray(value)) {
    score *= Math.min(1.25, 0.75 + value.length * 0.1);
  }

  return score;
}

function deepCloneValue(value) {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (value && typeof value === "object") {
    return deepClone(value);
  }

  return value === undefined || value === null ? "" : value;
}

function mergeKnownKeys(target, source) {
  if (!source || typeof source !== "object") return;

  Object.keys(target).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue)) {
      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue.map((entry) => cleanString(entry)).filter(Boolean);
      } else if (typeof sourceValue === "string") {
        target[key] = splitToList(sourceValue);
      }
      return;
    }

    if (targetValue && typeof targetValue === "object") {
      if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
        mergeKnownKeys(targetValue, sourceValue);
      }
      return;
    }

    const cleaned = cleanString(sourceValue);
    if (cleaned) {
      target[key] = cleaned;
    }
  });
}

function createEmptySectionMap() {
  return Object.fromEntries(SECTION_KEYS.map((key) => [key, ""]));
}

function splitToLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => cleanString(line))
    .filter(Boolean);
}

function detectSectionKeyFromLabel(label) {
  const normalized = cleanString(label)
    .toLowerCase()
    .replace(/[^a-z\s&/.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";
  if (/\b(summary|about|profile|objective|overview)\b/.test(normalized)) return "summary";
  if (/\b(experience|employment|work history|professional experience)\b/.test(normalized)) return "experience";
  if (/\b(education|academic|academics|qualification)\b/.test(normalized)) return "education";
  if (/\b(project|projects|case study|case studies|portfolio work|work samples)\b/.test(normalized)) return "projects";
  if (/\b(skill|skills|technical skill|tech stack|technologies|tools|expertise)\b/.test(normalized)) return "skills";
  if (/\b(contact|reach|personal details)\b/.test(normalized)) return "contact";
  if (/\b(link|links|social|profiles?)\b/.test(normalized)) return "links";
  return "";
}

function splitTextIntoSections(text) {
  const buckets = Object.fromEntries(SECTION_KEYS.map((key) => [key, []]));
  let activeSection = "general";

  splitToLines(text).forEach((line) => {
    const inlineMatch = line.match(/^([A-Za-z][A-Za-z &/().-]{1,40})\s*[:|-]\s*(.+)$/);
    if (inlineMatch) {
      const inlineSection = detectSectionKeyFromLabel(inlineMatch[1]);
      if (inlineSection) {
        activeSection = inlineSection;
        buckets[activeSection].push(cleanString(inlineMatch[2]));
        return;
      }
    }

    const detectedSection = detectSectionKeyFromLabel(line);
    const isLikelyHeading = line.length <= 42 && !/[:|\-]/.test(line) && line.split(/\s+/).length <= 5;
    if (detectedSection && isLikelyHeading) {
      activeSection = detectedSection;
      return;
    }

    buckets[activeSection].push(line);
  });

  return Object.fromEntries(
    SECTION_KEYS.map((sectionKey) => [sectionKey, buckets[sectionKey].join("\n").trim()])
  );
}

function getSectionLines(sections, key, limit = Number.POSITIVE_INFINITY) {
  const lines = splitToLines(sections && sections[key]);
  if (!Number.isFinite(limit) || limit <= 0) {
    return lines;
  }
  return lines.slice(0, limit);
}

function isLikelyContactOrLinkLine(line) {
  const value = cleanString(line);
  if (!value) return false;
  return /@|https?:\/\/|www\.|\b(linkedin|github|instagram|twitter|x\.com|phone|email|contact)\b/i.test(value);
}

function isLikelySkillListLine(line) {
  const value = cleanString(line);
  if (!value) return false;
  if (/\b(skills?|tech stack|tools?|technologies?)\b/i.test(value)) return true;
  const chunks = value.split(/[,|/]+/).map((entry) => cleanString(entry)).filter(Boolean);
  return chunks.length >= 4 && chunks.every((entry) => entry.split(/\s+/).length <= 3);
}

function deriveBackgroundSummary({ text, sections }) {
  const summaryCandidates = [
    ...getSectionLines(sections, "summary", 3),
    ...getSectionLines(sections, "general", 6),
  ];

  for (const line of summaryCandidates) {
    if (isLikelyContactOrLinkLine(line)) continue;
    if (isLikelySkillListLine(line)) continue;
    if (line.split(/\s+/).length < 6) continue;
    return compactSummary(line, 240);
  }

  const fallback = getSectionLines(sections, "general", 4)
    .filter((line) => !isLikelyContactOrLinkLine(line))
    .join(" ");

  return compactSummary(fallback || text, 240);
}

function extractEducationProgramText({ text, sections }) {
  const candidates = [
    ...getSectionLines(sections, "education", 6),
    ...splitToLines(text).filter((line) => EDUCATION_HINT_REGEX.test(line)).slice(0, 5),
  ];

  for (const rawLine of candidates) {
    const line = cleanString(rawLine.replace(/^education\s*[:|-]\s*/i, ""));
    if (!line) continue;
    if (!EDUCATION_HINT_REGEX.test(line) && line.split(/\s+/).length < 3) continue;
    if (PROJECT_HINT_REGEX.test(line) && !EDUCATION_HINT_REGEX.test(line)) continue;
    return compactSummary(line, 160);
  }

  return "";
}

function extractRoleFromLine(rawLine) {
  let line = cleanString(rawLine);
  if (!line) return "";

  line = line.replace(/^(experience|role|current role|position|title)\s*[:|-]\s*/i, "").trim();
  if (!line) return "";
  if (!ROLE_HINT_REGEX.test(line)) return "";
  if (/^(passionate|seeking|objective|summary|profile)\b/i.test(line)) return "";

  const wordCount = line.split(/\s+/).length;
  if (wordCount > 16 && !/\bat\b/i.test(line)) {
    return "";
  }

  if (line.length > 120) {
    line = line.slice(0, 120).trim();
  }

  return line;
}

function extractCurrentRoleText({ sourceType, text, sections }) {
  const candidates = [
    ...getSectionLines(sections, "experience", 6),
    ...getSectionLines(sections, "summary", 4),
    ...getSectionLines(sections, "general", 8),
    ...splitToLines(text).slice(0, 12),
  ];

  for (const candidate of candidates) {
    const role = extractRoleFromLine(candidate);
    if (role) return role;
  }

  return sourceType === "resume" && /\bstudent\b/i.test(text) ? "Student" : "";
}

function extractProjectSectionSummary(sections) {
  const lines = getSectionLines(sections, "projects", 5);
  if (!lines.length) {
    return "";
  }
  return compactSummary(lines.join(" | "), 320);
}

function buildProjectSummary({ existingValue, sections, urls, socials, portfolioUrl }) {
  const sectionProjects = extractProjectSectionSummary(sections);
  const projectLinks = formatProjectLinks(urls || [], socials || {}, portfolioUrl || "");
  const candidate = uniqueStrings([existingValue, sectionProjects, projectLinks].filter(Boolean)).join(" | ");
  return compactSummary(candidate, 320);
}

function normalizeBackgroundValue(value, { originalText, sections, signals }) {
  const cleaned = cleanString(value);
  const likelyNoisy =
    !cleaned ||
    isLikelyContactOrLinkLine(cleaned) ||
    isLikelySkillListLine(cleaned) ||
    (cleaned.split(/\s+/).length > 60 && /\b(project|education|skills)\b/i.test(cleaned));

  const source = likelyNoisy ? deriveBackgroundSummary({ text: originalText, sections }) : cleaned;
  const withoutSignals = cleanString(
    source
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/\b(?:www\.)?linkedin\.com\S*/gi, "")
      .replace(/\b(?:www\.)?github\.com\S*/gi, "")
  );

  const compact = compactSummary(withoutSignals, 240);
  if (compact) {
    return compact;
  }

  if (signals && signals.urls && signals.urls.length) {
    return "";
  }

  return compactSummary(cleaned, 240);
}

function normalizeEducationProgram(value, { originalText, sections }) {
  const cleaned = cleanString(value);
  const fallback = extractEducationProgramText({ text: originalText, sections });

  if (!cleaned) {
    return fallback;
  }

  if (PROJECT_HINT_REGEX.test(cleaned) && !EDUCATION_HINT_REGEX.test(cleaned)) {
    return fallback;
  }

  if (cleaned.split(/\s+/).length > 26 && fallback) {
    return fallback;
  }

  return compactSummary(cleaned, 160);
}

function normalizeCurrentRole(value, { sourceType, originalText, sections }) {
  const direct = extractRoleFromLine(value);
  if (direct) {
    return direct;
  }

  return extractCurrentRoleText({ sourceType, text: originalText, sections });
}

function normalizeSkillSummary(value) {
  const tokens = splitToList(value)
    .map((entry) => normalizeSkillToken(entry))
    .filter(Boolean);
  return uniqueStrings(tokens).join(", ");
}

function extractSkillTokensFromSections(text, sections) {
  const skillLines = [
    ...getSectionLines(sections, "skills", 10),
    ...splitToLines(text).filter((line) => /\b(skills?|tech stack|technologies|tools?|expertise)\b/i.test(line)),
  ];

  const tokens = [];
  skillLines.forEach((line) => {
    const payload = line.replace(/^(technical\s+)?(skills?|tech stack|technologies|tools?|expertise)\s*[:|-]\s*/i, "");
    splitToList(payload).forEach((token) => {
      const normalized = normalizeSkillToken(token);
      if (normalized) {
        tokens.push(normalized);
      }
    });
  });

  return uniqueStrings(tokens);
}

function normalizeSkillToken(value) {
  const cleaned = cleanString(value).replace(/[()]/g, "");
  if (!cleaned) return "";
  if (/^(technical\s+)?skills?$/i.test(cleaned)) return "";
  if (cleaned.length > 36) return "";

  const key = cleaned.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
  if (SKILL_CANONICAL_MAP[key]) {
    return SKILL_CANONICAL_MAP[key];
  }

  if (/^[A-Z0-9.+#-]{2,8}$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return cleaned
    .split(" ")
    .map((entry) => {
      if (!entry) return "";
      if (/^[A-Z0-9.+#-]{2,8}$/.test(entry)) return entry.toUpperCase();
      return entry[0].toUpperCase() + entry.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}

function extractDeterministicSignals(text, portfolioUrl) {
  const normalizedText = normalizeText(text);
  const sections = splitTextIntoSections(normalizedText);

  const emails = uniqueStrings(
    (normalizedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])
      .map((entry) => normalizeEmail(entry))
      .filter(Boolean)
  );

  const phones = uniqueStrings(
    (normalizedText.match(/(?:\+?\d[\d().\s-]{7,}\d)/g) || [])
      .map((entry) => normalizePhone(entry))
      .filter((entry) => countDigits(entry) >= 8)
  );

  const urls = uniqueStrings(extractUrls(normalizedText).map((entry) => normalizeExternalUrl(entry)).filter(Boolean));
  const socials = mapSocialUrls(urls);
  const socialHandles = extractSocialHandlesFromText(normalizedText);

  socials.linkedin = firstNonEmpty(socials.linkedin, normalizeSocialField("linkedin", socialHandles.linkedin));
  socials.github = firstNonEmpty(socials.github, normalizeSocialField("github", socialHandles.github));
  socials.twitter = firstNonEmpty(socials.twitter, normalizeSocialField("twitter", socialHandles.twitter));
  socials.instagram = firstNonEmpty(socials.instagram, normalizeSocialField("instagram", socialHandles.instagram));
  socials.website = firstNonEmpty(socials.website, normalizeSocialField("website", socialHandles.website));

  if (portfolioUrl && !socials.website) {
    socials.website = normalizeExternalUrl(portfolioUrl);
  }

  const languages = detectLanguages(normalizedText);
  const skillTokens = extractSkillTokensFromSections(normalizedText, sections);

  return {
    emails,
    phones,
    urls,
    socials,
    languages,
    sections,
    skillTokens,
  };
}

function extractUrls(text) {
  const input = String(text || "");
  const pattern =
    /(?:https?:\/\/|www\.)[^\s<>()\[\]{}"']+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|dev|app|ai|co|in|me|edu|gov|info|xyz|site|blog|tech|design|uk|us|ca|au)(?:\/[^\s<>()\[\]{}"']*)?/gi;

  const matches = [];
  for (const match of input.matchAll(pattern)) {
    const rawToken = String(match[0] || "");
    const token = rawToken.replace(/[),.;:!?]+$/g, "").trim();
    if (!token) continue;

    const startIndex = Number(match.index || 0);
    const before = startIndex > 0 ? input[startIndex - 1] : "";
    if (before === "@") continue;
    if (/^[^/\s]+@/.test(token)) continue;

    const candidate = /^https?:\/\//i.test(token) ? token : `https://${token}`;
    let host = "";
    try {
      host = new URL(candidate).hostname.toLowerCase();
    } catch (error) {
      continue;
    }

    const firstLabel = host.split(".")[0] || "";
    if (firstLabel.length < 2 && !hostnameMatches(host, ["x.com"])) {
      continue;
    }

    matches.push(token);
  }

  return uniqueStrings(matches);
}

function normalizeExternalUrl(value) {
  const cleaned = cleanString(value).replace(/[),.;:!?]+$/g, "");
  if (!cleaned || /^mailto:/i.test(cleaned)) {
    return "";
  }

  const candidate = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch (error) {
    return "";
  }

  if (!/^https?:$/i.test(parsed.protocol)) {
    return "";
  }

  try {
    assertPublicHostname(parsed.hostname);
  } catch (error) {
    return "";
  }

  parsed.hash = "";
  return parsed.toString();
}

function mapSocialUrls(urls) {
  const socials = {
    linkedin: "",
    github: "",
    website: "",
    twitter: "",
    instagram: "",
  };

  urls.forEach((urlValue) => {
    let host = "";
    try {
      host = new URL(urlValue).hostname.toLowerCase();
    } catch (error) {
      return;
    }

    if (!socials.linkedin && hostnameMatches(host, ["linkedin.com", "lnkd.in"])) {
      socials.linkedin = urlValue;
      return;
    }

    if (!socials.github && hostnameMatches(host, ["github.com"])) {
      socials.github = urlValue;
      return;
    }

    if (!socials.twitter && hostnameMatches(host, ["twitter.com", "x.com"])) {
      socials.twitter = urlValue;
      return;
    }

    if (!socials.instagram && hostnameMatches(host, ["instagram.com"])) {
      socials.instagram = urlValue;
      return;
    }

    if (!socials.website && !knownSocialHosts.some((domain) => hostnameMatches(host, [domain]))) {
      socials.website = urlValue;
    }
  });

  return socials;
}

function extractSocialHandlesFromText(text) {
  const input = String(text || "");
  const readLabeledValue = (labelPattern) => {
    const match = input.match(new RegExp(`${labelPattern}\\s*[:|-]\\s*([^\\n]+)`, "i"));
    return match && match[1] ? cleanString(match[1].split(/[|,]/)[0]) : "";
  };

  return {
    linkedin: readLabeledValue("linkedin"),
    github: readLabeledValue("github"),
    twitter: readLabeledValue("(?:twitter|x)"),
    instagram: readLabeledValue("instagram"),
    website: readLabeledValue("(?:website|portfolio|site)"),
  };
}

function hostnameMatches(hostname, allowedDomains) {
  const host = String(hostname || "").toLowerCase();
  return allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function normalizeSocialField(field, rawValue) {
  const cleaned = cleanString(rawValue);
  if (!cleaned) return "";

  if (field === "twitter" && /^@[A-Za-z0-9_]{1,15}$/.test(cleaned)) {
    return `https://x.com/${cleaned.slice(1)}`;
  }

  if (field === "instagram" && /^@?[A-Za-z0-9_.]{1,30}$/.test(cleaned) && !cleaned.includes(".")) {
    return `https://instagram.com/${cleaned.replace(/^@/, "")}`;
  }

  if (field === "github" && /^[A-Za-z0-9-]{1,39}$/.test(cleaned) && !cleaned.includes(".")) {
    return `https://github.com/${cleaned}`;
  }

  if (field === "linkedin" && /^[A-Za-z0-9-]{3,100}$/.test(cleaned) && !cleaned.includes(".")) {
    return `https://www.linkedin.com/in/${cleaned}`;
  }

  const normalized = normalizeExternalUrl(cleaned);
  if (!normalized) {
    return "";
  }

  let host = "";
  try {
    host = new URL(normalized).hostname.toLowerCase();
  } catch (error) {
    return "";
  }

  if (field === "linkedin" && !hostnameMatches(host, ["linkedin.com", "lnkd.in"])) return "";
  if (field === "github" && !hostnameMatches(host, ["github.com"])) return "";
  if (field === "twitter" && !hostnameMatches(host, ["twitter.com", "x.com"])) return "";
  if (field === "instagram" && !hostnameMatches(host, ["instagram.com"])) return "";

  return normalized;
}

function normalizeEmail(rawValue) {
  const candidate = cleanString(rawValue).toLowerCase();
  if (!candidate) return "";
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(candidate)) return "";
  return candidate;
}

function normalizePhone(rawValue) {
  const compact = cleanString(rawValue)
    .replace(/[^\d+()\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) return "";
  if (countDigits(compact) < 8) return "";
  return compact;
}

function countDigits(value) {
  return String(value || "").replace(/\D/g, "").length;
}

function normalizeLanguages(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((entry) => toTitleCase(cleanString(entry))).filter(Boolean));
  }

  if (typeof value === "string") {
    return uniqueStrings(splitToList(value).map((entry) => toTitleCase(entry)).filter(Boolean));
  }

  return [];
}

function detectLanguages(text) {
  const result = [];
  const normalized = String(text || "");
  const patterns = [
    ["English", /\benglish\b/i],
    ["Hindi", /\bhindi\b/i],
    ["Spanish", /\bspanish\b/i],
    ["Arabic", /\barabic\b/i],
    ["Bengali", /\bbengali\b/i],
    ["French", /\bfrench\b/i],
    ["German", /\bgerman\b/i],
  ];

  for (const [label, regex] of patterns) {
    if (regex.test(normalized)) {
      result.push(label);
    }
  }

  const languageLine = normalized.match(/languages?\s*[:|-]\s*([^\n]+)/i);
  if (languageLine && languageLine[1]) {
    splitToList(languageLine[1]).forEach((entry) => {
      const formatted = toTitleCase(entry);
      if (formatted) {
        result.push(formatted);
      }
    });
  }

  return uniqueStrings(result);
}

function splitToList(value) {
  return String(value || "")
    .split(/[\n,;|/]+/)
    .map((entry) => cleanString(entry))
    .filter(Boolean);
}

function toTitleCase(value) {
  const cleaned = cleanString(value);
  if (!cleaned) return "";
  return cleaned
    .toLowerCase()
    .split(" ")
    .map((entry) => (entry ? entry[0].toUpperCase() + entry.slice(1) : entry))
    .join(" ");
}

function guessNameFromText(text) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  const blacklist = /resume|curriculum|vitae|linkedin|github|phone|email|address|profile|summary|objective/i;

  for (const line of lines) {
    if (blacklist.test(line)) continue;
    if (/\d/.test(line)) continue;
    if (line.length < 4 || line.length > 80) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4 && words.every((entry) => /^[A-Za-z.'-]+$/.test(entry))) {
      return words.join(" ");
    }
  }

  return "";
}

function guessLocationFromText(text) {
  const normalized = String(text || "");
  const explicit = normalized.match(/location\s*[:|-]\s*([^\n]+)/i);
  if (explicit && explicit[1]) {
    return cleanString(explicit[1]);
  }

  const cityMatch = normalized.match(
    /(new york|san francisco|london|berlin|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|remote|india|usa|united states|canada|uae|singapore)/i
  );

  return cityMatch ? cleanString(cityMatch[0]) : "";
}

function inferSkillSummary(text, sections = null) {
  const sectionMap = sections || splitTextIntoSections(text);
  const tokens = extractSkillTokensFromSections(text, sectionMap);
  if (tokens.length) {
    return tokens.join(", ");
  }

  const skillLine = findLineWithKeyword(text, /(skills|tech stack|tools|technology|expertise)/i);
  if (skillLine) {
    const cleanedLine = skillLine.replace(/^(technical\s+)?(skills?|tech stack|tools?|technology|expertise)\s*[:|-]\s*/i, "");
    return normalizeSkillSummary(cleanedLine);
  }

  return "";
}

function findLineWithKeyword(text, regex) {
  const lines = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (regex.test(line)) {
      return line;
    }
  }

  return "";
}

function compactSummary(text, limit) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, limit);
}

function formatProjectLinks(urls, socials, portfolioUrl) {
  const blocked = new Set(
    [
      socials.linkedin,
      socials.github,
      socials.twitter,
      socials.instagram,
      socials.website,
      portfolioUrl,
    ]
      .filter(Boolean)
      .map((entry) => String(entry).toLowerCase())
  );

  const projectLinks = urls.filter((urlValue) => !blocked.has(String(urlValue).toLowerCase())).slice(0, 5);
  return projectLinks.join(" | ");
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (isMeaningfulValue(value)) {
      return value;
    }
  }
  return "";
}

function classifyRoleFromProfile(profile) {
  const sample = [
    profile.experience.education.program,
    profile.experience.work.currentRole,
    profile.experience.freelance.services,
    profile.experience.founder.venture,
    profile.context.currentFocus,
    profile.identity.background,
  ]
    .join(" ")
    .toLowerCase();

  return classifyPathFromText(sample);
}

function classifyPathFromText(text) {
  const input = String(text || "").toLowerCase();
  if (/(student|semester|btech|college|university|internship|school)/i.test(input)) return "student";
  if (/(freelance|client|contract|independent|consultant)/i.test(input)) return "freelancer";
  if (/(founder|startup|cofounder|venture)/i.test(input)) return "founder";
  if (/(professional|manager|company|engineer|developer|designer|analyst|career|work)/i.test(input)) {
    return "professional";
  }
  return "explorer";
}

function normalizePrimaryRole(role) {
  const value = String(role || "").toLowerCase();
  const allowed = new Set(["student", "professional", "freelancer", "founder", "explorer"]);
  return allowed.has(value) ? value : "explorer";
}

function computeCompletionRatio(profile) {
  const filled = countLeafSlots(profile, PROFILE_COMPLETION_KEYS, true);
  if (!PROFILE_COMPLETION_TOTAL) return 0;
  return Number((filled / PROFILE_COMPLETION_TOTAL).toFixed(2));
}

function countLeafSlots(profile, topKeys, filledOnly) {
  return topKeys.reduce((total, key) => total + countLeafSlotsNode(profile[key], filledOnly), 0);
}

function countLeafSlotsNode(value, filledOnly) {
  if (Array.isArray(value)) {
    if (!filledOnly) return 1;
    return value.length > 0 ? 1 : 0;
  }

  if (value && typeof value === "object") {
    return Object.values(value).reduce((sum, entry) => sum + countLeafSlotsNode(entry, filledOnly), 0);
  }

  if (!filledOnly) return 1;
  return isMeaningfulValue(value) ? 1 : 0;
}

function isMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).some((entry) => isMeaningfulValue(entry));
  }
  return cleanString(value).length > 0;
}

function createTimedCache({ maxEntries, ttlMs }) {
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }

      store.delete(key);
      store.set(key, entry);

      return deepClone(entry.value);
    },

    set(key, value) {
      store.set(key, {
        value: deepClone(value),
        expiresAt: Date.now() + ttlMs,
      });

      if (store.size > maxEntries) {
        const oldestKey = store.keys().next().value;
        store.delete(oldestKey);
      }
    },

    prune() {
      const now = Date.now();
      store.forEach((entry, key) => {
        if (now > entry.expiresAt) {
          store.delete(key);
        }
      });
    },
  };
}

function getFileExtension(fileName) {
  const segments = String(fileName || "").toLowerCase().split(".");
  return segments.length > 1 ? segments.pop() : "";
}

function clipText(text, maxChars) {
  return String(text || "").slice(0, maxChars);
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function uniqueStrings(values) {
  const output = [];
  const seen = new Set();

  values.forEach((value) => {
    const cleaned = cleanString(value);
    if (!cleaned) return;

    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      output.push(cleaned);
    }
  });

  return output;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

if (require.main === module) {
  startServer();
}

app.app = app;
app.startServer = startServer;
app.PROFILE_TEMPLATE = PROFILE_TEMPLATE;
app.UserFacingError = UserFacingError;
app.normalizeWebUrl = normalizeWebUrl;
app.parseAndNormalizeProfileJson = parseAndNormalizeProfileJson;
app.parseJsonFromModel = parseJsonFromModel;
app.extractUrls = extractUrls;
app.extractDeterministicSignals = extractDeterministicSignals;
app.normalizeProfile = normalizeProfile;
app.buildHeuristicProfile = buildHeuristicProfile;
app.blendProfilesWithWeights = blendProfilesWithWeights;
app.extractProfileForHarness = extractProfileForHarness;
app.normalizeExternalUrl = normalizeExternalUrl;

module.exports = app;