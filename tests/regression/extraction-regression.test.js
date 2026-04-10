const test = require("node:test");
const assert = require("node:assert/strict");

const {
  UserFacingError,
  normalizeWebUrl,
  extractDeterministicSignals,
  buildHeuristicProfile,
  normalizeProfile,
  parseAndNormalizeProfileJson,
  parseJsonFromModel,
} = require("../../server");

test("URL extraction ignores email-domain and abbreviation false positives", () => {
  const text = [
    "John Doe",
    "Email: john@example.com",
    "Education: B.Tech Computer Science",
    "Portfolio: johndoe.dev",
    "LinkedIn: linkedin.com/in/johndoe",
  ].join("\n");

  const signals = extractDeterministicSignals(text, "");

  assert.equal(signals.emails[0], "john@example.com");
  assert.equal(signals.socials.website, "https://johndoe.dev/");
  assert.equal(signals.urls.includes("https://example.com/"), false);
  assert.equal(signals.urls.includes("https://b.tech/"), false);
});

test("Malformed JSON edits are rejected gracefully", () => {
  assert.throws(
    () => parseAndNormalizeProfileJson('{"identity": {"fullName": "Jane"'),
    (error) => {
      assert.equal(error instanceof UserFacingError, true);
      assert.match(error.message, /Malformed JSON edits/i);
      return true;
    }
  );
});

test("Valid JSON edits are normalized and unknown keys are dropped", () => {
  const raw = JSON.stringify({
    identity: {
      fullName: "Jane Doe",
      contact: {
        email: "INVALID_EMAIL",
      },
      socials: {
        website: "janedoe.dev",
      },
    },
    context: {
      primaryRole: "wizard",
    },
    hacked: {
      injected: true,
    },
  });

  const profile = parseAndNormalizeProfileJson(raw);

  assert.equal(profile.identity.fullName, "Jane Doe");
  assert.equal(profile.identity.contact.email, "");
  assert.equal(profile.identity.socials.website, "https://janedoe.dev/");
  assert.equal(profile.context.primaryRole, "explorer");
  assert.equal(Object.prototype.hasOwnProperty.call(profile, "hacked"), false);
});

test("Private and local portfolio URLs are rejected", () => {
  assert.throws(() => normalizeWebUrl("http://127.0.0.1:3000"), /Private or local network URLs are not allowed/i);
  assert.throws(() => normalizeWebUrl("http://localhost:8080"), /Private or local network URLs are not allowed/i);
  assert.throws(() => normalizeWebUrl("http://192.168.1.2/path"), /Private or local network URLs are not allowed/i);
});

test("JSON parser recovers from fenced and trailing-comma output", () => {
  const raw = [
    "```json",
    '{"identity":{"fullName":"Alex Example",},"context":{"primaryRole":"professional",},}',
    "```",
  ].join("\n");

  const parsed = parseJsonFromModel(raw);

  assert.equal(parsed.identity.fullName, "Alex Example");
  assert.equal(parsed.context.primaryRole, "professional");
});

test("Section-aware heuristic keeps education and projects separated", () => {
  const text = [
    "Dhairya Jangir",
    "SUMMARY",
    "Passionate full-stack web developer with a focus on clean UI and performance.",
    "EXPERIENCE",
    "Software Engineer Intern at Acme Labs",
    "EDUCATION",
    "B.Tech Computer Science, 2026",
    "PROJECTS",
    "Built a campus placement analytics dashboard with React and Node.js",
    "TECHNICAL SKILLS",
    "javascript, nodejs, react, sql",
  ].join("\n");

  const signals = extractDeterministicSignals(text, "");
  const profile = buildHeuristicProfile({
    sourceType: "resume",
    text,
    portfolioUrl: "",
    signals,
  });

  assert.match(profile.experience.education.program, /B\.Tech Computer Science/i);
  assert.equal(/placement analytics dashboard/i.test(profile.experience.education.program), false);
  assert.match(profile.experience.projects.studentProjects, /placement analytics dashboard/i);
  assert.equal(/Passionate full-stack web developer/i.test(profile.experience.work.currentRole), false);
  assert.match(profile.experience.work.currentRole, /Software Engineer Intern/i);
});

test("Labeled social handles normalize to canonical URLs", () => {
  const text = [
    "GitHub: dhairyajangir",
    "LinkedIn: dhairya-jangir",
    "Website: dhairyajangir.dev",
  ].join("\n");

  const signals = extractDeterministicSignals(text, "");

  assert.equal(signals.socials.github, "https://github.com/dhairyajangir");
  assert.equal(signals.socials.linkedin, "https://www.linkedin.com/in/dhairya-jangir");
  assert.equal(signals.socials.website, "https://dhairyajangir.dev/");
});

test("Extraction scope drops non-resume-native fields and normalizes skills", () => {
  const text = [
    "Aisha Khan",
    "Skills: javascript, nodejs, react, sql",
    "Education: B.Tech Information Technology",
  ].join("\n");

  const signals = extractDeterministicSignals(text, "");
  const profile = normalizeProfile(
    {
      capability: {
        coreSkills: "TECHNICAL SKILLS, javascript, nodejs, react, sql",
      },
      intent: {
        shortTerm: "Land a dream role in 3 months",
      },
      behavior: {
        workStyle: "fast and flexible",
      },
      preferences: {
        interests: "building SaaS products",
      },
    },
    {
      sourceType: "resume",
      portfolioUrl: "",
      signals,
      originalText: text,
      extractionScope: true,
    }
  );

  assert.equal(profile.intent.shortTerm, "");
  assert.equal(profile.behavior.workStyle, "");
  assert.equal(profile.preferences.interests, "");
  assert.equal(profile.capability.coreSkills.includes("JavaScript"), true);
  assert.equal(profile.capability.coreSkills.includes("Node.js"), true);
  assert.equal(profile.capability.coreSkills.includes("React"), true);
});
