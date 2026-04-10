const QUESTION_SETS = {
  discovery: [
    {
      id: "currentFocus",
      question: "What are you currently focused on in your life right now?",
      why: "This helps the system choose the right question path for your reality, not a generic script.",
      type: "textarea",
      placeholder: "Example: I am a second year engineering student preparing for internships...",
      mapsTo: "context.currentFocus",
      optional: false,
      depth: 1,
    },
    {
      id: "primaryRole",
      question: "Which description fits you best right now?",
      why: "This improves relevance so we ask fewer irrelevant questions.",
      type: "select",
      options: [
        { value: "", label: "Select one" },
        { value: "student", label: "Student" },
        { value: "professional", label: "Working professional" },
        { value: "freelancer", label: "Freelancer" },
        { value: "founder", label: "Founder" },
        { value: "explorer", label: "Explorer / unsure" },
      ],
      mapsTo: "context.primaryRole",
      optional: true,
      depth: 1,
    },
    {
      id: "preferredName",
      question: "What should I call you?",
      why: "A preferred name personalizes your profile and how AI addresses you.",
      type: "text",
      placeholder: "Preferred name",
      mapsTo: "identity.preferredName",
      optional: true,
      depth: 1,
    },
    {
      id: "location",
      question: "Where are you currently based?",
      why: "Location can shape opportunities, timelines, and recommendations.",
      type: "text",
      placeholder: "City, country",
      mapsTo: "identity.location",
      optional: true,
      depth: 1,
    },
    {
      id: "background",
      question: "Tell me a little about your background so far.",
      why: "This creates context behind your choices, strengths, and direction.",
      type: "textarea",
      placeholder: "A short personal or educational background",
      mapsTo: "identity.background",
      optional: true,
      depth: 2,
    },
    {
      id: "languages",
      question: "Which languages are you comfortable communicating in?",
      why: "Language preferences help AI communicate clearly and inclusively.",
      type: "multiselect",
      options: [
        { value: "english", label: "English" },
        { value: "hindi", label: "Hindi" },
        { value: "spanish", label: "Spanish" },
        { value: "arabic", label: "Arabic" },
        { value: "bengali", label: "Bengali" },
        { value: "other", label: "Other" },
      ],
      mapsTo: "identity.languages",
      optional: true,
      depth: 2,
    },
    {
      id: "email",
      question: "If you want, share an email for your biodata record.",
      why: "Contact details are optional and only included if useful to you.",
      type: "email",
      placeholder: "name@example.com",
      mapsTo: "identity.contact.email",
      optional: true,
      sensitive: true,
      depth: 2,
    },
    {
      id: "phone",
      question: "If useful, what phone number should be in your biodata?",
      why: "This is sensitive data and fully optional.",
      type: "tel",
      placeholder: "Phone number",
      mapsTo: "identity.contact.phone",
      optional: true,
      sensitive: true,
      depth: 2,
    },
    {
      id: "linkedinProfile",
      question: "Would you like to add your LinkedIn profile link?",
      why: "Social profiles help connect your biodata to your public professional identity.",
      type: "text",
      placeholder: "https://www.linkedin.com/in/your-profile",
      mapsTo: "identity.socials.linkedin",
      optional: true,
      depth: 1,
    },
    {
      id: "githubProfile",
      question: "Do you want to include your GitHub profile?",
      why: "GitHub links give a direct view of your projects and technical work.",
      type: "text",
      placeholder: "https://github.com/your-handle",
      mapsTo: "identity.socials.github",
      optional: true,
      depth: 1,
    },
    {
      id: "portfolioWebsite",
      question: "Do you have a personal website or portfolio to add?",
      why: "A personal site can present your work narrative in your own voice.",
      type: "text",
      placeholder: "https://your-site.com",
      mapsTo: "identity.socials.website",
      optional: true,
      depth: 1,
    },
    {
      id: "twitterHandle",
      question: "Any X/Twitter handle you want in your biodata?",
      why: "Optional social context helps shape your broader public presence.",
      type: "text",
      placeholder: "https://x.com/your-handle",
      mapsTo: "identity.socials.twitter",
      optional: true,
      depth: 2,
    },
    {
      id: "instagramProfile",
      question: "Would you like to include your Instagram profile?",
      why: "This is optional and useful only if it reflects your personal brand.",
      type: "text",
      placeholder: "https://instagram.com/your-handle",
      mapsTo: "identity.socials.instagram",
      optional: true,
      depth: 2,
    },
    {
      id: "dateOfBirth",
      question: "Would you like to include your date of birth?",
      why: "Some biodata formats include this, but it is optional.",
      type: "date",
      mapsTo: "identity.dateOfBirth",
      optional: true,
      sensitive: true,
      depth: 2,
    },
  ],
  student: [
    {
      id: "studentProgram",
      question: "What are you currently studying?",
      why: "Program details anchor your education context.",
      type: "text",
      placeholder: "Example: BTech in Computer Science",
      mapsTo: "experience.education.program",
      optional: false,
      depth: 1,
    },
    {
      id: "studentYear",
      question: "Which year or semester are you in?",
      why: "This helps prioritize near-term milestones.",
      type: "text",
      placeholder: "Example: 2nd year, semester 4",
      mapsTo: "experience.education.year",
      optional: false,
      depth: 1,
    },
    {
      id: "studentProjects",
      question: "What projects have you built or contributed to?",
      why: "Projects often show practical strengths better than grades alone.",
      type: "textarea",
      placeholder: "Share 1-3 projects and your role",
      mapsTo: "experience.projects.studentProjects",
      optional: true,
      depth: 1,
    },
    {
      id: "studentSkills",
      question: "Which skills are you currently building most actively?",
      why: "This captures current momentum and growth direction.",
      type: "textarea",
      placeholder: "Tools, frameworks, or subject strengths",
      mapsTo: "capability.activeSkills",
      optional: false,
      depth: 1,
    },
    {
      id: "internshipGoal",
      question: "What kind of internship or first opportunity are you targeting?",
      why: "This translates your profile into immediate intent.",
      type: "textarea",
      mapsTo: "intent.internshipGoal",
      optional: true,
      depth: 1,
    },
    {
      id: "studentLearningStyle",
      question: "How do you learn best when facing a difficult topic?",
      why: "Knowing your learning pattern improves support quality.",
      type: "textarea",
      mapsTo: "behavior.learningStyle",
      optional: true,
      depth: 2,
    },
  ],
  professional: [
    {
      id: "currentRole",
      question: "What role are you currently in?",
      why: "Role context improves relevance of recommendations and framing.",
      type: "text",
      placeholder: "Example: Product Designer, Data Analyst",
      mapsTo: "experience.work.currentRole",
      optional: false,
      depth: 1,
    },
    {
      id: "yearsExperience",
      question: "How much experience do you have in your field?",
      why: "Experience level helps calibrate advice depth.",
      type: "select",
      options: [
        { value: "", label: "Select one" },
        { value: "0-2", label: "0-2 years" },
        { value: "3-5", label: "3-5 years" },
        { value: "6-10", label: "6-10 years" },
        { value: "10+", label: "10+ years" },
      ],
      mapsTo: "experience.work.yearsExperience",
      optional: true,
      depth: 1,
    },
    {
      id: "recentImpact",
      question: "What is one impact you are proud of in your recent work?",
      why: "Impact highlights outcomes, not just responsibilities.",
      type: "textarea",
      mapsTo: "experience.work.recentImpact",
      optional: true,
      depth: 1,
    },
    {
      id: "nextCareerMove",
      question: "What career move are you aiming for next?",
      why: "This sharpens your short-term planning profile.",
      type: "textarea",
      mapsTo: "intent.nextCareerMove",
      optional: false,
      depth: 1,
    },
    {
      id: "professionalStrengths",
      question: "Which strengths do people rely on you for at work?",
      why: "This captures dependable capabilities and reputation.",
      type: "textarea",
      mapsTo: "capability.strengths",
      optional: true,
      depth: 1,
    },
    {
      id: "leadershipStyle",
      question: "How would you describe your leadership or collaboration style?",
      why: "Behavioral style influences role fit and growth paths.",
      type: "textarea",
      mapsTo: "behavior.collaborationStyle",
      optional: true,
      depth: 2,
    },
  ],
  freelancer: [
    {
      id: "freelanceServices",
      question: "What services do you currently offer as a freelancer?",
      why: "Service clarity helps define your market positioning.",
      type: "textarea",
      mapsTo: "experience.freelance.services",
      optional: false,
      depth: 1,
    },
    {
      id: "targetClients",
      question: "Who are your ideal clients?",
      why: "Client targeting makes your profile strategically useful.",
      type: "textarea",
      mapsTo: "experience.freelance.targetClients",
      optional: false,
      depth: 1,
    },
    {
      id: "portfolioHighlight",
      question: "Share one project that best represents your work.",
      why: "A strong example gives instant clarity to others.",
      type: "textarea",
      mapsTo: "experience.projects.portfolioHighlight",
      optional: true,
      depth: 1,
    },
    {
      id: "freelanceTools",
      question: "What tools or systems run your freelance workflow?",
      why: "Workflow tools reveal operational maturity and strengths.",
      type: "textarea",
      mapsTo: "capability.tools",
      optional: true,
      depth: 1,
    },
    {
      id: "incomeGoal",
      question: "What is your near-term income or growth goal?",
      why: "Goals help prioritize decisions and opportunities.",
      type: "text",
      mapsTo: "intent.nearTermIncomeGoal",
      optional: true,
      depth: 1,
    },
    {
      id: "freelanceAvailability",
      question: "How available are you for new work right now?",
      why: "Availability helps set realistic planning assumptions.",
      type: "text",
      mapsTo: "context.availability",
      optional: true,
      depth: 2,
    },
  ],
  founder: [
    {
      id: "startupName",
      question: "What are you building right now?",
      why: "This anchors your founder context in a concrete mission.",
      type: "text",
      placeholder: "Startup name or project mission",
      mapsTo: "experience.founder.venture",
      optional: false,
      depth: 1,
    },
    {
      id: "startupStage",
      question: "What stage are you in today?",
      why: "Stage determines the right strategic questions.",
      type: "select",
      options: [
        { value: "", label: "Select one" },
        { value: "idea", label: "Idea" },
        { value: "mvp", label: "MVP" },
        { value: "early-users", label: "Early users" },
        { value: "revenue", label: "Revenue" },
        { value: "scaling", label: "Scaling" },
      ],
      mapsTo: "experience.founder.stage",
      optional: true,
      depth: 1,
    },
    {
      id: "problemStatement",
      question: "What user problem are you most focused on solving?",
      why: "Clear problem framing strengthens decision quality.",
      type: "textarea",
      mapsTo: "experience.founder.problem",
      optional: false,
      depth: 1,
    },
    {
      id: "tractionSignal",
      question: "What traction signal are you proud of so far?",
      why: "Traction indicates what is already working.",
      type: "textarea",
      mapsTo: "experience.founder.traction",
      optional: true,
      depth: 1,
    },
    {
      id: "teamShape",
      question: "What does your team setup look like?",
      why: "Team context affects execution speed and constraints.",
      type: "text",
      mapsTo: "context.teamShape",
      optional: true,
      depth: 1,
    },
    {
      id: "growthBet",
      question: "What is your biggest growth bet for the next quarter?",
      why: "This captures strategic intent and priority.",
      type: "textarea",
      mapsTo: "intent.growthBet",
      optional: true,
      depth: 2,
    },
  ],
  explorer: [
    {
      id: "curiosityArea",
      question: "What areas are you currently curious about exploring?",
      why: "Curiosity often reveals the best direction before certainty exists.",
      type: "textarea",
      mapsTo: "preferences.curiosityAreas",
      optional: false,
      depth: 1,
    },
    {
      id: "experiments",
      question: "What are you trying right now to find your direction?",
      why: "Current experiments show movement and initiative.",
      type: "textarea",
      mapsTo: "experience.experiments",
      optional: true,
      depth: 1,
    },
    {
      id: "blockers",
      question: "What is making direction feel difficult right now?",
      why: "Blockers help tailor realistic support and next steps.",
      type: "textarea",
      mapsTo: "context.blockers",
      optional: true,
      depth: 1,
    },
    {
      id: "explorerGoal",
      question: "What would progress look like in the next month?",
      why: "Even uncertain paths need concrete short checkpoints.",
      type: "text",
      mapsTo: "intent.shortTerm",
      optional: false,
      depth: 1,
    },
    {
      id: "supportType",
      question: "What kind of support would help you most right now?",
      why: "This captures preferences for guidance and accountability.",
      type: "textarea",
      mapsTo: "context.supportNeeded",
      optional: true,
      depth: 1,
    },
  ],
  common: [
    {
      id: "proudMoment",
      question: "What are you most proud of so far?",
      why: "Pride moments often show authentic strengths and values.",
      type: "textarea",
      mapsTo: "experience.proudMoment",
      optional: true,
      depth: 1,
    },
    {
      id: "coreSkills",
      question: "List the skills or domains you feel most confident in.",
      why: "This shapes your capability map for future matching.",
      type: "textarea",
      mapsTo: "capability.coreSkills",
      optional: false,
      depth: 1,
    },
    {
      id: "shortTermGoal",
      question: "What is your short-term goal for the next 3 to 6 months?",
      why: "This provides clear near-term intent.",
      type: "textarea",
      mapsTo: "intent.shortTerm",
      optional: false,
      depth: 1,
    },
    {
      id: "longTermGoal",
      question: "What long-term future are you working toward?",
      why: "Long-term direction helps align decisions and priorities.",
      type: "textarea",
      mapsTo: "intent.longTerm",
      optional: true,
      depth: 1,
    },
    {
      id: "workStyle",
      question: "How do you prefer to work day to day?",
      why: "Work style improves environment and strategy fit.",
      type: "textarea",
      mapsTo: "behavior.workStyle",
      optional: true,
      depth: 1,
    },
    {
      id: "communicationStyle",
      question: "How do you prefer AI to communicate with you?",
      why: "Communication preference improves comfort and trust.",
      type: "select",
      options: [
        { value: "", label: "Select one" },
        { value: "concise", label: "Concise and direct" },
        { value: "balanced", label: "Balanced detail" },
        { value: "deep", label: "Detailed and deep" },
        { value: "examples", label: "Example-driven" },
      ],
      mapsTo: "preferences.communicationStyle",
      optional: true,
      depth: 1,
    },
    {
      id: "interests",
      question: "What interests energize you outside work or study?",
      why: "Interests add human context and motivation signals.",
      type: "textarea",
      mapsTo: "preferences.interests",
      optional: true,
      depth: 1,
    },
    {
      id: "constraints",
      question: "Any constraints to keep in mind? (time, resources, responsibilities)",
      why: "Constraints keep planning realistic and respectful.",
      type: "textarea",
      mapsTo: "context.constraints",
      optional: true,
      depth: 2,
    },
    {
      id: "values",
      question: "Which personal values most guide your decisions?",
      why: "Values explain choices when options are similar.",
      type: "textarea",
      mapsTo: "behavior.values",
      optional: true,
      depth: 2,
    },
    {
      id: "supportNeeded",
      question: "What support do you want AI to provide consistently?",
      why: "This defines how AI should be useful beyond this session.",
      type: "textarea",
      mapsTo: "context.supportNeeded",
      optional: true,
      depth: 2,
    },
  ],
};

const pathLabels = {
  student: "Student",
  professional: "Professional",
  freelancer: "Freelancer",
  founder: "Founder",
  explorer: "Explorer",
};

const RESUME_SECTION_MATCHERS = [
  { key: "summary", regex: /^(summary|professional summary|profile|about me)$/i },
  { key: "objective", regex: /^(objective|career objective)$/i },
  { key: "experience", regex: /^(experience|work experience|professional experience|employment)$/i },
  { key: "education", regex: /^(education|academic background|academics)$/i },
  { key: "projects", regex: /^(projects|project experience)$/i },
  { key: "skills", regex: /^(skills|technical skills|core skills)$/i },
  { key: "certifications", regex: /^(certifications|certificates)$/i },
  { key: "achievements", regex: /^(achievements|accomplishments)$/i },
];

const PORTFOLIO_SECTION_MATCHERS = [
  { key: "about", regex: /^(about|about me|who i am|profile)$/i },
  { key: "summary", regex: /^(summary|intro|introduction)$/i },
  { key: "experience", regex: /^(experience|work experience|professional experience)$/i },
  { key: "projects", regex: /^(projects|featured projects|case studies|portfolio)$/i },
  { key: "skills", regex: /^(skills|tech stack|technology|expertise)$/i },
  { key: "services", regex: /^(services|what i do)$/i },
  { key: "education", regex: /^(education|academic background)$/i },
  { key: "contact", regex: /^(contact|get in touch|reach out)$/i },
];

const PROFILE_TEMPLATES = {
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

const APP_STATE_STORAGE_KEY = "adaptiveIdentityState.v1";
const APP_STATE_STORAGE_VERSION = 1;
const STATE_PERSIST_DELAY_MS = 140;
let persistStateTimer = null;

const appElements = {
  app: document.getElementById("app"),
  resultSidebarToggleBtn: document.getElementById("resultSidebarToggleBtn"),
  manualProgressWrap: document.getElementById("manualProgressWrap"),
  questionCard: document.getElementById("questionCard"),
  manualEntrySection: document.getElementById("manualEntrySection"),
  inputModeSelect: document.getElementById("inputModeSelect"),
  inputModeHint: document.getElementById("inputModeHint"),
  quickStartSection: document.getElementById("quickStartSection"),
  selectSourceResumeBtn: document.getElementById("selectSourceResumeBtn"),
  selectSourcePortfolioBtn: document.getElementById("selectSourcePortfolioBtn"),
  extractionCoverageHint: document.getElementById("extractionCoverageHint"),
  resumeExtractorCard: document.getElementById("resumeExtractorCard"),
  portfolioExtractorCard: document.getElementById("portfolioExtractorCard"),
  selectResumeBtn: document.getElementById("selectResumeBtn"),
  extractResumeBtn: document.getElementById("extractResumeBtn"),
  resumeFileInput: document.getElementById("resumeFileInput"),
  resumePreviewSection: document.getElementById("resumePreviewSection"),
  resumePreviewMeta: document.getElementById("resumePreviewMeta"),
  togglePreviewSizeBtn: document.getElementById("togglePreviewSizeBtn"),
  resumePdfPreview: document.getElementById("resumePdfPreview"),
  resumeTextPreview: document.getElementById("resumeTextPreview"),
  resumeStatus: document.getElementById("resumeStatus"),
  extractPortfolioBtn: document.getElementById("extractPortfolioBtn"),
  portfolioUrlInput: document.getElementById("portfolioUrlInput"),
  portfolioStatus: document.getElementById("portfolioStatus"),
  historyList: document.getElementById("historyList"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  progressLabel: document.getElementById("progressLabel"),
  progressFill: document.getElementById("progressFill"),
  pathBadge: document.getElementById("pathBadge"),
  profileView: document.getElementById("profileView"),
  jsonView: document.getElementById("jsonView"),
  jsonEditor: document.getElementById("jsonEditor"),
  jsonStatus: document.getElementById("jsonStatus"),
  applyJsonBtn: document.getElementById("applyJsonBtn"),
  formatJsonBtn: document.getElementById("formatJsonBtn"),
  copyJsonBtn: document.getElementById("copyJsonBtn"),
  viewProfileBtn: document.getElementById("viewProfileBtn"),
  viewJsonBtn: document.getElementById("viewJsonBtn"),
};

const state = {
  profile: cloneProfileTemplate(),
  answers: {},
  answerOrder: [],
  skipped: new Set(),
  path: "explorer",
  depthMode: "light",
  flow: [],
  currentIndex: 0,
  hasAnsweredAtLeastOne: false,
  viewMode: "profile",
  jsonDirty: false,
  inputMode: "manual",
  quickExtractSource: "resume",
  extractionSourceLock: null,
  selectedResumeFile: null,
  resumePreviewObjectUrl: "",
  resumePreviewExpanded: false,
  resumePreviewSnapshot: null,
  extractionCoverageHintSource: "",
  resumeStatusMessage: "",
  resumeStatusError: false,
  portfolioStatusMessage: "",
  portfolioStatusError: false,
  portfolioUrlDraft: "",
  jsonEditorDraft: "",
  resultSidebarOpen: false,
  resultSidebarManual: false,
};

const QUESTION_INDEX = indexQuestions();
const API_BASE_CANDIDATES = resolveApiBases();

initialize();

function initialize() {
  restorePersistedState();
  buildFlow();
  bindStaticEvents();
  setInputMode(state.inputMode);
  setQuickExtractSource(state.quickExtractSource);
  if (state.extractionCoverageHintSource) {
    showExtractionCoverageHint(state.extractionCoverageHintSource);
  } else {
    hideExtractionCoverageHint();
  }
  restoreResumePreviewSnapshot();
  setResumePreviewExpanded(state.resumePreviewExpanded, { skipPersist: true });
  if (appElements.portfolioUrlInput) {
    appElements.portfolioUrlInput.value = state.portfolioUrlDraft || "";
  }
  setResumeStatus(state.resumeStatusMessage || "", Boolean(state.resumeStatusError));
  setPortfolioStatus(state.portfolioStatusMessage || "", Boolean(state.portfolioStatusError));
  updateExtractionLockUI();
  renderAll();

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", persistAppStateNow);
  }
}

function restorePersistedState() {
  let parsed = null;

  try {
    const raw = localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return;
    parsed = JSON.parse(raw);
  } catch (error) {
    return;
  }

  if (!parsed || parsed.version !== APP_STATE_STORAGE_VERSION || !parsed.state) {
    return;
  }

  const restored = parsed.state;
  state.profile = normalizeIncomingProfile(restored.profile || cloneProfileTemplate());
  state.answers = restored.answers && typeof restored.answers === "object" ? restored.answers : {};
  state.answerOrder = Array.isArray(restored.answerOrder)
    ? restored.answerOrder.filter((questionId) => Object.prototype.hasOwnProperty.call(state.answers, questionId))
    : [];
  state.skipped = new Set(Array.isArray(restored.skipped) ? restored.skipped : []);
  state.path = typeof restored.path === "string" ? restored.path : "explorer";
  state.depthMode = restored.depthMode === "deep" ? "deep" : "light";
  state.currentIndex = Number.isInteger(restored.currentIndex) ? restored.currentIndex : 0;
  state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0 || Boolean(restored.hasAnsweredAtLeastOne);
  state.viewMode = restored.viewMode === "json" ? "json" : "profile";
  state.jsonDirty = Boolean(restored.jsonDirty);
  state.inputMode = restored.inputMode === "extract" ? "extract" : "manual";
  state.quickExtractSource = restored.quickExtractSource === "portfolio" ? "portfolio" : "resume";
  state.extractionSourceLock =
    restored.extractionSourceLock === "portfolio" || restored.extractionSourceLock === "resume"
      ? restored.extractionSourceLock
      : null;
  state.resumePreviewExpanded = Boolean(restored.resumePreviewExpanded);
  state.resumePreviewSnapshot =
    restored.resumePreviewSnapshot && typeof restored.resumePreviewSnapshot === "object"
      ? {
          meta: cleanString(restored.resumePreviewSnapshot.meta),
          text: cleanString(restored.resumePreviewSnapshot.text),
        }
      : null;
  state.extractionCoverageHintSource = restored.extractionCoverageHintSource === "link" ? "link" : "";
  if (restored.extractionCoverageHintSource === "file") {
    state.extractionCoverageHintSource = "file";
  }
  state.resumeStatusMessage = cleanString(restored.resumeStatusMessage);
  state.resumeStatusError = Boolean(restored.resumeStatusError);
  state.portfolioStatusMessage = cleanString(restored.portfolioStatusMessage);
  state.portfolioStatusError = Boolean(restored.portfolioStatusError);
  state.portfolioUrlDraft = cleanString(restored.portfolioUrlDraft);
  state.jsonEditorDraft = cleanString(restored.jsonEditorDraft);
  state.resultSidebarOpen = Boolean(restored.resultSidebarOpen);
  state.resultSidebarManual = Boolean(restored.resultSidebarManual);
}

function buildPersistableState() {
  return {
    profile: state.profile,
    answers: state.answers,
    answerOrder: state.answerOrder,
    skipped: Array.from(state.skipped),
    path: state.path,
    depthMode: state.depthMode,
    currentIndex: state.currentIndex,
    hasAnsweredAtLeastOne: state.hasAnsweredAtLeastOne,
    viewMode: state.viewMode,
    jsonDirty: state.jsonDirty,
    inputMode: state.inputMode,
    quickExtractSource: state.quickExtractSource,
    extractionSourceLock: state.extractionSourceLock,
    resumePreviewExpanded: state.resumePreviewExpanded,
    resumePreviewSnapshot: state.resumePreviewSnapshot,
    extractionCoverageHintSource: state.extractionCoverageHintSource,
    resumeStatusMessage: state.resumeStatusMessage,
    resumeStatusError: state.resumeStatusError,
    portfolioStatusMessage: state.portfolioStatusMessage,
    portfolioStatusError: state.portfolioStatusError,
    portfolioUrlDraft: state.portfolioUrlDraft,
    jsonEditorDraft: state.jsonEditorDraft,
    resultSidebarOpen: state.resultSidebarOpen,
    resultSidebarManual: state.resultSidebarManual,
  };
}

function persistAppStateNow() {
  try {
    const payload = {
      version: APP_STATE_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state: buildPersistableState(),
    };
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Ignore localStorage persistence failures.
  }
}

function schedulePersistedStateSave() {
  if (persistStateTimer) {
    window.clearTimeout(persistStateTimer);
    persistStateTimer = null;
  }

  persistStateTimer = window.setTimeout(() => {
    persistStateTimer = null;
    persistAppStateNow();
  }, STATE_PERSIST_DELAY_MS);
}

function clearPersistedState() {
  try {
    localStorage.removeItem(APP_STATE_STORAGE_KEY);
  } catch (error) {
    // Ignore localStorage cleanup failures.
  }
}

function bindStaticEvents() {
  appElements.clearAllBtn.addEventListener("click", () => {
    state.profile = cloneProfileTemplate();
    state.answers = {};
    state.answerOrder = [];
    state.skipped = new Set();
    state.path = "explorer";
    state.depthMode = "light";
    state.currentIndex = 0;
    state.hasAnsweredAtLeastOne = false;
    state.jsonDirty = false;
    state.inputMode = "manual";
    state.quickExtractSource = "resume";
    state.extractionSourceLock = null;
    state.selectedResumeFile = null;
    state.resumePreviewExpanded = false;
    state.resumePreviewSnapshot = null;
    state.extractionCoverageHintSource = "";
    state.resumeStatusMessage = "";
    state.resumeStatusError = false;
    state.portfolioStatusMessage = "";
    state.portfolioStatusError = false;
    state.portfolioUrlDraft = "";
    state.jsonEditorDraft = "";
    state.resultSidebarOpen = false;
    state.resultSidebarManual = false;
    if (appElements.resumeFileInput) {
      appElements.resumeFileInput.value = "";
    }
    if (appElements.portfolioUrlInput) {
      appElements.portfolioUrlInput.value = "";
    }
    setResumeStatus("");
    setPortfolioStatus("");
    hideExtractionCoverageHint();
    setExtractButtonState(appElements.extractResumeBtn, "idle");
    setExtractButtonState(appElements.extractPortfolioBtn, "idle");
    clearResumePreview();
    setQuickExtractSource("resume");
    updateExtractionLockUI();
    setInputMode("manual");
    buildFlow();
    renderAll();
    clearPersistedState();
  });

  if (appElements.selectSourceResumeBtn) {
    appElements.selectSourceResumeBtn.addEventListener("click", () => {
      handleQuickSourceSelection("resume");
    });
  }

  if (appElements.selectSourcePortfolioBtn) {
    appElements.selectSourcePortfolioBtn.addEventListener("click", () => {
      handleQuickSourceSelection("portfolio");
    });
  }

  if (appElements.inputModeSelect) {
    appElements.inputModeSelect.addEventListener("change", (event) => {
      setInputMode(event.target.value);
    });
  }

  if (appElements.resultSidebarToggleBtn) {
    appElements.resultSidebarToggleBtn.addEventListener("click", () => {
      if (!state.hasAnsweredAtLeastOne) return;
      state.resultSidebarOpen = !state.resultSidebarOpen;
      state.resultSidebarManual = true;
      renderAll();
    });
  }

  appElements.viewProfileBtn.addEventListener("click", () => {
    state.viewMode = "profile";
    renderRightPanel();
  });

  appElements.viewJsonBtn.addEventListener("click", () => {
    state.viewMode = "json";
    renderRightPanel();
  });

  appElements.applyJsonBtn.addEventListener("click", applyJsonEdits);
  appElements.formatJsonBtn.addEventListener("click", formatJsonEditor);
  if (appElements.copyJsonBtn) {
    appElements.copyJsonBtn.addEventListener("click", async () => {
      await copyJsonResponse();
    });
  }
  if (appElements.selectResumeBtn && appElements.resumeFileInput) {
    appElements.selectResumeBtn.addEventListener("click", () => {
      appElements.resumeFileInput.click();
    });

    appElements.resumeFileInput.addEventListener("change", async (event) => {
      await handleResumeSelectionPreview(event);
    });
  }

  if (appElements.togglePreviewSizeBtn) {
    appElements.togglePreviewSizeBtn.addEventListener("click", () => {
      setResumePreviewExpanded(!state.resumePreviewExpanded);
    });
  }

  if (appElements.extractResumeBtn) {
    appElements.extractResumeBtn.addEventListener("click", async () => {
      await handleResumeExtractionFromSelection();
    });
  }

  if (appElements.extractPortfolioBtn && appElements.portfolioUrlInput) {
    appElements.extractPortfolioBtn.addEventListener("click", async () => {
      await handlePortfolioExtraction();
    });

    appElements.portfolioUrlInput.addEventListener("keydown", async (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      await handlePortfolioExtraction();
    });

    appElements.portfolioUrlInput.addEventListener("input", () => {
      state.portfolioUrlDraft = String(appElements.portfolioUrlInput.value || "").trim();
      schedulePersistedStateSave();
    });
  }

  appElements.jsonEditor.addEventListener("input", () => {
    state.jsonDirty = true;
    state.jsonEditorDraft = appElements.jsonEditor.value;
    appElements.jsonStatus.textContent = "Unapplied edits in JSON.";
    appElements.jsonStatus.classList.remove("error");
    schedulePersistedStateSave();
  });
}

function buildFlow() {
  const depthLevel = state.depthMode === "deep" ? 2 : 1;
  state.path = classifyPath();

  const selected = [];
  const pushUnique = (question) => {
    if (question.depth > depthLevel) return;
    if (!selected.some((item) => item.id === question.id)) {
      selected.push(question);
    }
  };

  QUESTION_SETS.discovery.forEach(pushUnique);
  QUESTION_SETS[state.path].forEach(pushUnique);
  QUESTION_SETS.common.forEach(pushUnique);

  state.flow = selected;
  state.profile.meta.profilePath = state.path;
  state.profile.meta.depthMode = state.depthMode;
  state.profile.meta.lastUpdated = new Date().toISOString();

  const firstPending = findNextPendingIndex(0);
  state.currentIndex = firstPending === -1 ? state.flow.length : firstPending;
  updateCompletionMeta();
}

function classifyPath() {
  const explicitRole = String(state.answers.primaryRole || "").toLowerCase();
  if (pathLabels[explicitRole]) return explicitRole;

  const focus = String(state.answers.currentFocus || "").toLowerCase();
  const matcher = [explicitRole, focus].join(" ");

  if (/(student|semester|btech|college|university|school|campus|exam|internship)/i.test(matcher)) {
    return "student";
  }
  if (/(freelance|client|contract|gig|independent)/i.test(matcher)) {
    return "freelancer";
  }
  if (/(founder|startup|building a product|cofounder|venture)/i.test(matcher)) {
    return "founder";
  }
  if (/(job|career|professional|manager|company|promotion|work)/i.test(matcher)) {
    return "professional";
  }
  return "explorer";
}

function maybeAdjustDepth(answerValue) {
  const value = Array.isArray(answerValue) ? answerValue.join(" ") : String(answerValue || "");
  const normalized = value.trim().toLowerCase();
  if (!normalized) return;

  if (/(quick|short|tired|skip|later|not now)/i.test(normalized)) {
    state.depthMode = "light";
    return;
  }

  const answeredValues = Object.values(state.answers)
    .map((entry) => (Array.isArray(entry) ? entry.join(" ") : String(entry || "")))
    .filter((entry) => entry.trim().length > 0);

  const totalLength = answeredValues.reduce((acc, item) => acc + item.length, 0);
  const averageLength = answeredValues.length ? totalLength / answeredValues.length : 0;

  if (averageLength > 75 || normalized.length > 120) {
    state.depthMode = "deep";
  }
}

function renderAll() {
  updateResultSidebarToggleState();
  const shouldSplit = state.hasAnsweredAtLeastOne && state.resultSidebarOpen;
  appElements.app.classList.toggle("split-active", shouldSplit);
  renderProgress();
  renderQuestionCard();
  renderHistory();
  renderRightPanel();
  schedulePersistedStateSave();
}

function updateResultSidebarToggleState() {
  if (!state.hasAnsweredAtLeastOne) {
    state.resultSidebarOpen = false;
    state.resultSidebarManual = false;
  } else if (!state.resultSidebarManual) {
    state.resultSidebarOpen = true;
  }

  if (!appElements.resultSidebarToggleBtn) return;

  appElements.resultSidebarToggleBtn.disabled = !state.hasAnsweredAtLeastOne;
  appElements.resultSidebarToggleBtn.setAttribute("aria-disabled", String(!state.hasAnsweredAtLeastOne));
  appElements.resultSidebarToggleBtn.setAttribute("aria-pressed", String(state.resultSidebarOpen));
  appElements.resultSidebarToggleBtn.classList.toggle("is-open", state.resultSidebarOpen);
  const toggleLabel = state.resultSidebarOpen ? "Close result panel" : "Open result panel";
  appElements.resultSidebarToggleBtn.setAttribute("aria-label", toggleLabel);
  appElements.resultSidebarToggleBtn.setAttribute("title", toggleLabel);
}

function renderProgress() {
  const total = state.flow.length || 1;
  const completed = state.flow.filter((q) => isAnswered(q.id) || state.skipped.has(q.id)).length;
  const currentOrdinal = Math.min(state.currentIndex + 1, total);
  appElements.progressLabel.textContent = `Question ${currentOrdinal} of ${total} | Completed ${completed}`;
  appElements.progressFill.style.width = `${Math.max((completed / total) * 100, 2)}%`;
  appElements.pathBadge.textContent = `Path: ${pathLabels[state.path] || "Discovering"}`;
}

function renderQuestionCard() {
  if (state.currentIndex >= state.flow.length) {
    appElements.questionCard.innerHTML = `
      <div class="question-meta">
        <span class="meta-chip">Session complete</span>
      </div>
      <h2 class="question-text">Your profile draft is ready.</h2>
      <p class="why-text">Review your answers on the left and refine your profile or JSON on the right.</p>
      <div class="actions">
        <button type="button" class="primary-btn" id="reviewIncompleteBtn">Review unanswered prompts</button>
      </div>
    `;

    const reviewBtn = document.getElementById("reviewIncompleteBtn");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", () => {
        const nextPending = findNextPendingIndex(0);
        if (nextPending !== -1) {
          state.currentIndex = nextPending;
        }
        renderAll();
      });
    }
    return;
  }

  const question = state.flow[state.currentIndex];
  const existingValue = state.answers[question.id];

  appElements.questionCard.innerHTML = `
    <div class="question-meta">
      <span class="meta-chip">One question at a time</span>
      ${question.optional ? '<span class="meta-chip optional">Optional</span>' : ""}
      ${question.sensitive ? '<span class="meta-chip sensitive">Sensitive</span>' : ""}
    </div>
    <h2 class="question-text">${escapeHtml(question.question)}</h2>
    <p class="why-text">Why we ask this: ${escapeHtml(question.why)}</p>
    <div class="control-wrap">
      ${inputMarkup(question, existingValue, "current")}
    </div>
    <div class="actions">
      <button type="button" class="ghost-btn" id="prevBtn">Previous</button>
      <button type="button" class="ghost-btn" id="skipBtn">Skip</button>
      <button type="button" class="primary-btn" id="saveNextBtn">Save and continue</button>
    </div>
  `;

  const prevBtn = document.getElementById("prevBtn");
  const skipBtn = document.getElementById("skipBtn");
  const saveNextBtn = document.getElementById("saveNextBtn");

  prevBtn.addEventListener("click", () => {
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    renderAll();
  });

  skipBtn.addEventListener("click", () => {
    skipQuestion(question);
  });

  saveNextBtn.addEventListener("click", () => {
    const value = readInputValue(question, "current");
    if (!question.optional && isEmptyValue(value)) {
      appElements.jsonStatus.textContent = "This question is required for a meaningful profile. You can still skip if needed.";
      appElements.jsonStatus.classList.add("error");
      return;
    }
    appElements.jsonStatus.textContent = "";
    appElements.jsonStatus.classList.remove("error");
    answerQuestion(question, value);
  });
}

function answerQuestion(question, rawValue) {
  const value = normalizeValue(rawValue);
  if (isEmptyValue(value)) {
    clearAnswer(question);
  } else {
    setAnswer(question, value);
  }

  state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0;
  maybeAdjustDepth(value);
  buildFlow();
  pulseShift();

  const nextPending = findNextPendingIndex(state.currentIndex + 1);
  if (nextPending !== -1) {
    state.currentIndex = nextPending;
  } else {
    const fallbackPending = findNextPendingIndex(0);
    state.currentIndex = fallbackPending === -1 ? state.flow.length : fallbackPending;
  }

  updateCompletionMeta();
  renderAll();
}

function skipQuestion(question) {
  state.skipped.add(question.id);
  clearAtPath(state.profile, question.mapsTo);
  delete state.answers[question.id];
  removeFromOrder(question.id);
  state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0;

  const nextPending = findNextPendingIndex(state.currentIndex + 1);
  state.currentIndex = nextPending !== -1 ? nextPending : state.flow.length;
  updateCompletionMeta();
  renderAll();
}

function setAnswer(question, value) {
  state.answers[question.id] = value;
  state.skipped.delete(question.id);
  setAtPath(state.profile, question.mapsTo, value);
  if (!state.answerOrder.includes(question.id)) {
    state.answerOrder.push(question.id);
  }
}

function clearAnswer(question) {
  delete state.answers[question.id];
  state.skipped.delete(question.id);
  clearAtPath(state.profile, question.mapsTo);
  removeFromOrder(question.id);
}

function removeFromOrder(questionId) {
  state.answerOrder = state.answerOrder.filter((id) => id !== questionId);
}

function renderHistory() {
  if (!state.answerOrder.length) {
    appElements.historyList.innerHTML = `
      <div class="empty-note">
        Answers you submit will appear here. You can edit or delete any answer at any time.
      </div>
    `;
    return;
  }

  const cards = state.answerOrder
    .map((questionId) => {
      const question = QUESTION_INDEX[questionId];
      if (!question) return "";
      const currentValue = state.answers[questionId];
      return `
        <form class="history-item" data-question-id="${questionId}">
          <p class="question-label">${escapeHtml(question.question)}</p>
          ${inputMarkup(question, currentValue, `hist-${questionId}`)}
          <div class="history-actions">
            <button type="submit" class="small-btn">Save edit</button>
            <button type="button" class="ghost-btn" data-delete-id="${questionId}">Delete answer</button>
          </div>
        </form>
      `;
    })
    .join("");

  appElements.historyList.innerHTML = cards;

  appElements.historyList.querySelectorAll("form.history-item").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const questionId = form.getAttribute("data-question-id");
      const question = QUESTION_INDEX[questionId];
      if (!question) return;
      const value = normalizeValue(readInputValue(question, `hist-${questionId}`));
      if (isEmptyValue(value)) {
        clearAnswer(question);
      } else {
        setAnswer(question, value);
      }
      maybeAdjustDepth(value);
      buildFlow();
      updateCompletionMeta();
      renderAll();
    });
  });

  appElements.historyList.querySelectorAll("button[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const questionId = button.getAttribute("data-delete-id");
      const question = QUESTION_INDEX[questionId];
      if (!question) return;
      clearAnswer(question);
      buildFlow();
      updateCompletionMeta();
      renderAll();
    });
  });
}

function renderRightPanel() {
  const profileMode = state.viewMode === "profile";
  appElements.viewProfileBtn.classList.toggle("active", profileMode);
  appElements.viewProfileBtn.setAttribute("aria-selected", String(profileMode));
  appElements.viewJsonBtn.classList.toggle("active", !profileMode);
  appElements.viewJsonBtn.setAttribute("aria-selected", String(!profileMode));

  appElements.profileView.classList.toggle("hidden", !profileMode);
  appElements.jsonView.classList.toggle("hidden", profileMode);

  if (profileMode) {
    renderHumanProfile();
  } else {
    renderJsonEditor();
  }
}

function renderHumanProfile() {
  const sections = [
    {
      title: "About You",
      data: state.profile.identity,
    },
    {
      title: "Capabilities",
      data: state.profile.capability,
    },
    {
      title: "Experience",
      data: state.profile.experience,
    },
    {
      title: "Goals and Intent",
      data: state.profile.intent,
    },
    {
      title: "Behavior",
      data: state.profile.behavior,
    },
    {
      title: "Preferences",
      data: state.profile.preferences,
    },
    {
      title: "Current Context",
      data: state.profile.context,
    },
  ];

  appElements.profileView.innerHTML = sections
    .map((section) => {
      const lines = flattenToLabelValuePairs(section.data)
        .filter((entry) => isMeaningfulValue(entry.value))
        .map(
          (entry) =>
            `<li><strong>${escapeHtml(entry.label)}:</strong> ${escapeHtml(valueToReadableString(entry.value))}</li>`
        )
        .join("");

      return `
        <article class="profile-card">
          <h3>${escapeHtml(section.title)}</h3>
          ${
            lines
              ? `<ul class="profile-list">${lines}</ul>`
              : '<p class="profile-empty">Still building from your conversation.</p>'
          }
        </article>
      `;
    })
    .join("");
}

function renderJsonEditor() {
  if (state.jsonDirty && state.jsonEditorDraft) {
    if (appElements.jsonEditor.value !== state.jsonEditorDraft) {
      appElements.jsonEditor.value = state.jsonEditorDraft;
    }
    return;
  }

  if (!state.jsonDirty) {
    const formattedProfile = JSON.stringify(state.profile, null, 2);
    appElements.jsonEditor.value = formattedProfile;
    state.jsonEditorDraft = formattedProfile;
  }
}

function applyJsonEdits() {
  const raw = appElements.jsonEditor.value;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Root value must be a JSON object.");
    }

    state.profile = normalizeIncomingProfile(parsed);
    syncAnswersFromProfile();
    state.jsonDirty = false;
    state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0;
    maybeAdjustDepth(raw);
    buildFlow();
    renderAll();
    state.jsonEditorDraft = JSON.stringify(state.profile, null, 2);
    appElements.jsonStatus.textContent = "JSON applied successfully.";
    appElements.jsonStatus.classList.remove("error");
  } catch (error) {
    appElements.jsonStatus.textContent = `JSON error: ${error.message}`;
    appElements.jsonStatus.classList.add("error");
  }
}

function formatJsonEditor() {
  try {
    const parsed = normalizeIncomingProfile(JSON.parse(appElements.jsonEditor.value));
    appElements.jsonEditor.value = JSON.stringify(parsed, null, 2);
    state.jsonEditorDraft = appElements.jsonEditor.value;
    appElements.jsonStatus.textContent = "JSON formatted.";
    appElements.jsonStatus.classList.remove("error");
    schedulePersistedStateSave();
  } catch (error) {
    appElements.jsonStatus.textContent = `Cannot format invalid JSON: ${error.message}`;
    appElements.jsonStatus.classList.add("error");
  }
}

async function copyJsonResponse() {
  const jsonText = String(appElements.jsonEditor.value || "").trim();

  if (!jsonText) {
    appElements.jsonStatus.textContent = "Nothing to copy yet.";
    appElements.jsonStatus.classList.add("error");
    return;
  }

  try {
    await writeTextToClipboard(jsonText);
    appElements.jsonStatus.textContent = "JSON copied to clipboard.";
    appElements.jsonStatus.classList.remove("error");
    setCopyJsonButtonState("success");
  } catch (error) {
    appElements.jsonStatus.textContent = "Could not copy JSON. Use Ctrl+C as fallback.";
    appElements.jsonStatus.classList.add("error");
    setCopyJsonButtonState("idle");
  }
}

async function writeTextToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.top = "0";
  helper.style.left = "-9999px";

  document.body.appendChild(helper);
  helper.focus();
  helper.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(helper);

  if (!copied) {
    throw new Error("Copy command failed.");
  }
}

function setCopyJsonButtonState(status) {
  if (!appElements.copyJsonBtn) return;
  const defaultLabel = "Copy JSON response";
  const copiedLabel = "JSON copied";

  appElements.copyJsonBtn.classList.remove("is-copied");
  appElements.copyJsonBtn.setAttribute("aria-label", defaultLabel);
  appElements.copyJsonBtn.setAttribute("title", defaultLabel);
  if (appElements.copyJsonBtn._copiedTimer) {
    window.clearTimeout(appElements.copyJsonBtn._copiedTimer);
    appElements.copyJsonBtn._copiedTimer = null;
  }

  if (status === "success") {
    appElements.copyJsonBtn.classList.add("is-copied");
    appElements.copyJsonBtn.setAttribute("aria-label", copiedLabel);
    appElements.copyJsonBtn.setAttribute("title", copiedLabel);
    appElements.copyJsonBtn._copiedTimer = window.setTimeout(() => {
      appElements.copyJsonBtn.classList.remove("is-copied");
      appElements.copyJsonBtn.setAttribute("aria-label", defaultLabel);
      appElements.copyJsonBtn.setAttribute("title", defaultLabel);
      appElements.copyJsonBtn._copiedTimer = null;
    }, 1500);
  }
}

async function handleResumeSelectionPreview(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (state.extractionSourceLock && state.extractionSourceLock !== "resume") {
    setResumeStatus("File extraction is locked because link data already exists. Delete all answers to switch.", true);
    if (event.target) {
      event.target.value = "";
    }
    updateExtractionLockUI();
    return;
  }

  state.selectedResumeFile = file;
  setResumeStatus(`Previewing ${file.name}...`);

  try {
    await renderResumePreview(file);
    setResumeStatus("File preview ready. If correct, click Extract details from file.");
  } catch (error) {
    const message = error && error.message ? error.message : "Could not generate file preview.";
    setResumeStatus(message, true);
  } finally {
    if (event.target) {
      event.target.value = "";
    }
  }
}

async function handleResumeExtractionFromSelection() {
  if (state.extractionSourceLock && state.extractionSourceLock !== "resume") {
    setResumeStatus("File extraction is locked because link data already exists. Delete all answers to switch.", true);
    updateExtractionLockUI();
    return;
  }

  if (!state.selectedResumeFile) {
    setResumeStatus("Choose and preview a file first.", true);
    return;
  }

  setExtractButtonState(appElements.extractResumeBtn, "loading");
  if (appElements.selectResumeBtn) {
    appElements.selectResumeBtn.disabled = true;
  }
  setResumeStatus(`Extracting details from file: ${state.selectedResumeFile.name}...`);

  try {
    const extractedProfile = normalizeIncomingProfile(await requestAiResumeExtraction(state.selectedResumeFile));
    mergeProfileWithoutOverwriting(state.profile, extractedProfile);
    state.profile = normalizeIncomingProfile(state.profile);

    syncAnswersFromProfile();
    state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0;
    state.jsonDirty = false;
    maybeAdjustDepth(JSON.stringify(extractedProfile));
    buildFlow();
    state.viewMode = "profile";

    const pendingIndex = findNextPendingIndex(0);
    state.currentIndex = pendingIndex === -1 ? state.flow.length : pendingIndex;
    pulseShift();
    renderAll();

    setResumeStatus("File extraction complete and ready. Review and edit anything you want.");
    showExtractionCoverageHint("file");
    setExtractButtonState(appElements.extractResumeBtn, "success");
    state.extractionSourceLock = "resume";
    updateExtractionLockUI();
  } catch (error) {
    const message = error && error.message ? error.message : "Unknown extraction error.";
    setResumeStatus(`Could not extract file data: ${message}`, true);
    setExtractButtonState(appElements.extractResumeBtn, "idle");
    if (appElements.selectResumeBtn) {
      appElements.selectResumeBtn.disabled = false;
    }
    updateExtractionLockUI();
  }
}

function setResumeStatus(message, isError = false) {
  state.resumeStatusMessage = String(message || "");
  state.resumeStatusError = Boolean(isError);
  if (!appElements.resumeStatus) return;
  appElements.resumeStatus.textContent = message;
  appElements.resumeStatus.classList.toggle("error", isError);
  schedulePersistedStateSave();
}

async function renderResumePreview(file) {
  clearResumePreview();

  if (appElements.resumePreviewSection) {
    appElements.resumePreviewSection.classList.remove("hidden");
  }
  setResumePreviewExpanded(state.resumePreviewExpanded, { skipPersist: true });

  let previewMetaText = "";
  if (appElements.resumePreviewMeta) {
    previewMetaText = `Selected: ${file.name} (${formatFileSize(file.size)})`;
    appElements.resumePreviewMeta.textContent = previewMetaText;
  }

  const lowerName = String(file.name || "").toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || String(file.type || "").toLowerCase().includes("pdf");

  if (isPdf && appElements.resumePdfPreview) {
    state.resumePreviewObjectUrl = URL.createObjectURL(file);
    appElements.resumePdfPreview.src = state.resumePreviewObjectUrl;
    appElements.resumePdfPreview.classList.remove("hidden");
  }

  const preview = await requestResumePreview(file);
  const textPreview = String(preview.textPreview || "").trim();
  let textPreviewValue = "";
  if (appElements.resumeTextPreview) {
    if (textPreview) {
      textPreviewValue = textPreview;
      appElements.resumeTextPreview.textContent = textPreviewValue;
    } else {
      textPreviewValue = "Preview text was not available for this file, but extraction can still run.";
      appElements.resumeTextPreview.textContent = textPreviewValue;
    }
    appElements.resumeTextPreview.classList.remove("hidden");
  }

  state.resumePreviewSnapshot = {
    meta: previewMetaText,
    text: textPreviewValue,
  };
  schedulePersistedStateSave();
}

function restoreResumePreviewSnapshot() {
  if (!state.resumePreviewSnapshot || !appElements.resumePreviewSection) {
    return;
  }

  const snapshotMeta = String(state.resumePreviewSnapshot.meta || "");
  const snapshotText = String(state.resumePreviewSnapshot.text || "");
  if (!snapshotMeta && !snapshotText) {
    return;
  }

  appElements.resumePreviewSection.classList.remove("hidden");
  if (appElements.resumePreviewMeta) {
    appElements.resumePreviewMeta.textContent = snapshotMeta;
  }

  if (appElements.resumePdfPreview) {
    appElements.resumePdfPreview.src = "";
    appElements.resumePdfPreview.classList.add("hidden");
  }

  if (appElements.resumeTextPreview) {
    appElements.resumeTextPreview.textContent = snapshotText;
    appElements.resumeTextPreview.classList.toggle("hidden", !snapshotText);
  }

  if (!state.selectedResumeFile && !state.resumeStatusMessage) {
    setResumeStatus("Preview restored after reload. Re-upload the file if you want to run extraction again.");
  }
}

function clearResumePreview() {
  if (state.resumePreviewObjectUrl) {
    URL.revokeObjectURL(state.resumePreviewObjectUrl);
    state.resumePreviewObjectUrl = "";
  }

  if (appElements.resumePreviewSection) {
    appElements.resumePreviewSection.classList.add("hidden");
  }

  if (appElements.resumePreviewMeta) {
    appElements.resumePreviewMeta.textContent = "";
  }

  if (appElements.resumePdfPreview) {
    appElements.resumePdfPreview.src = "";
    appElements.resumePdfPreview.classList.add("hidden");
  }

  if (appElements.resumeTextPreview) {
    appElements.resumeTextPreview.textContent = "";
    appElements.resumeTextPreview.classList.add("hidden");
  }

  state.resumePreviewSnapshot = null;
  schedulePersistedStateSave();
}

function setResumePreviewExpanded(isExpanded, options = {}) {
  state.resumePreviewExpanded = Boolean(isExpanded);

  if (appElements.resumePreviewSection) {
    appElements.resumePreviewSection.classList.toggle("is-expanded", state.resumePreviewExpanded);
  }

  if (appElements.togglePreviewSizeBtn) {
    const actionLabel = state.resumePreviewExpanded ? "Reduce preview" : "Enlarge preview";
    appElements.togglePreviewSizeBtn.textContent = actionLabel;
    appElements.togglePreviewSizeBtn.setAttribute("aria-expanded", String(state.resumePreviewExpanded));
    appElements.togglePreviewSizeBtn.setAttribute("title", actionLabel);
  }

  if (!options.skipPersist) {
    schedulePersistedStateSave();
  }
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function requestResumePreview(file) {
  const payload = new FormData();
  payload.append("resume", file);

  let response;
  try {
    response = await fetchApiWithFallback("/api/preview/resume", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    throw new Error("Cannot reach preview service. Start the backend and try again.");
  }

  return parseApiJson(response);
}

async function handlePortfolioExtraction() {
  if (state.extractionSourceLock && state.extractionSourceLock !== "portfolio") {
    setPortfolioStatus(
      "Link extraction is locked because file data already exists. Delete all answers to switch.",
      true
    );
    updateExtractionLockUI();
    return;
  }

  const rawUrl = appElements.portfolioUrlInput ? appElements.portfolioUrlInput.value : "";
  state.portfolioUrlDraft = String(rawUrl || "").trim();
  let portfolioUrl = "";

  try {
    portfolioUrl = normalizeWebUrl(rawUrl);
    state.portfolioUrlDraft = portfolioUrl;
    if (appElements.portfolioUrlInput && appElements.portfolioUrlInput.value !== portfolioUrl) {
      appElements.portfolioUrlInput.value = portfolioUrl;
    }
  } catch (error) {
    setPortfolioStatus(error.message, true);
    setExtractButtonState(appElements.extractPortfolioBtn, "idle");
    return;
  }

  setExtractButtonState(appElements.extractPortfolioBtn, "loading");
  setPortfolioStatus(`Extracting details from link: ${portfolioUrl}...`);

  try {
    const extractedProfile = normalizeIncomingProfile(await requestAiPortfolioExtraction(portfolioUrl));
    mergeProfileWithoutOverwriting(state.profile, extractedProfile);
    state.profile = normalizeIncomingProfile(state.profile);

    syncAnswersFromProfile();
    state.hasAnsweredAtLeastOne = Object.keys(state.answers).length > 0;
    state.jsonDirty = false;
    maybeAdjustDepth(JSON.stringify(extractedProfile));
    buildFlow();
    state.viewMode = "profile";

    const pendingIndex = findNextPendingIndex(0);
    state.currentIndex = pendingIndex === -1 ? state.flow.length : pendingIndex;
    pulseShift();
    renderAll();

    setPortfolioStatus("Link extraction complete and ready. Review and edit anything you want.");
    showExtractionCoverageHint("link");
    setExtractButtonState(appElements.extractPortfolioBtn, "success");
    state.extractionSourceLock = "portfolio";
    updateExtractionLockUI();
  } catch (error) {
    const message = error && error.message ? error.message : "Unknown extraction error.";
    setPortfolioStatus(`Could not extract link data: ${message}`, true);
    setExtractButtonState(appElements.extractPortfolioBtn, "idle");
    updateExtractionLockUI();
  }
}

function setPortfolioStatus(message, isError = false) {
  state.portfolioStatusMessage = String(message || "");
  state.portfolioStatusError = Boolean(isError);
  if (!appElements.portfolioStatus) return;
  appElements.portfolioStatus.textContent = message;
  appElements.portfolioStatus.classList.toggle("error", isError);
  schedulePersistedStateSave();
}

function showExtractionCoverageHint(source) {
  if (!appElements.extractionCoverageHint) return;
  const sourceLabel = source === "link" ? "link" : "file";
  state.extractionCoverageHintSource = sourceLabel;
  appElements.extractionCoverageHint.textContent =
    `Extraction from ${sourceLabel} completed. Recommended next step: switch to Fill details manually to complete the uncovered fields now.`;
  appElements.extractionCoverageHint.classList.remove("hidden");
  appElements.extractionCoverageHint.classList.remove("is-emphasis");
  void appElements.extractionCoverageHint.offsetWidth;
  appElements.extractionCoverageHint.classList.add("is-emphasis");
  schedulePersistedStateSave();
}

function hideExtractionCoverageHint() {
  if (!appElements.extractionCoverageHint) return;
  state.extractionCoverageHintSource = "";
  appElements.extractionCoverageHint.textContent = "";
  appElements.extractionCoverageHint.classList.remove("is-emphasis");
  appElements.extractionCoverageHint.classList.add("hidden");
  schedulePersistedStateSave();
}

function setInputMode(mode) {
  const nextMode = mode === "extract" ? "extract" : "manual";
  state.inputMode = nextMode;

  if (appElements.inputModeSelect && appElements.inputModeSelect.value !== nextMode) {
    appElements.inputModeSelect.value = nextMode;
  }

  if (appElements.quickStartSection) {
    appElements.quickStartSection.classList.toggle("hidden", nextMode !== "extract");
  }

  if (appElements.manualProgressWrap) {
    appElements.manualProgressWrap.classList.toggle("hidden", nextMode !== "manual");
  }

  if (appElements.manualEntrySection) {
    appElements.manualEntrySection.classList.toggle("hidden", nextMode !== "manual");
  }

  if (appElements.inputModeHint) {
    appElements.inputModeHint.textContent =
      nextMode === "extract"
        ? "Extraction mode is enabled. Import from file or link, then review answers."
        : "Manual mode keeps the interface minimal. You can switch anytime.";
  }

  schedulePersistedStateSave();
}

function handleQuickSourceSelection(source) {
  if (state.extractionSourceLock && source !== state.extractionSourceLock) {
    if (source === "portfolio") {
      setPortfolioStatus("Link source is locked. Delete all answers to switch extraction source.", true);
    } else {
      setResumeStatus("File source is locked. Delete all answers to switch extraction source.", true);
    }
    setQuickExtractSource(state.extractionSourceLock);
    return;
  }

  setQuickExtractSource(source);
}

function setQuickExtractSource(source) {
  const nextSource = source === "portfolio" ? "portfolio" : "resume";
  state.quickExtractSource = nextSource;

  const resumeActive = nextSource === "resume";

  if (appElements.selectSourceResumeBtn) {
    appElements.selectSourceResumeBtn.classList.toggle("active", resumeActive);
    appElements.selectSourceResumeBtn.setAttribute("aria-checked", String(resumeActive));
  }

  if (appElements.selectSourcePortfolioBtn) {
    appElements.selectSourcePortfolioBtn.classList.toggle("active", !resumeActive);
    appElements.selectSourcePortfolioBtn.setAttribute("aria-checked", String(!resumeActive));
  }

  if (appElements.resumeExtractorCard) {
    appElements.resumeExtractorCard.classList.toggle("hidden", !resumeActive);
  }

  if (appElements.portfolioExtractorCard) {
    appElements.portfolioExtractorCard.classList.toggle("hidden", resumeActive);
  }

  schedulePersistedStateSave();
}

function isExtractionButtonLocked(button) {
  if (!button || !state.extractionSourceLock) return false;
  if (button === appElements.extractResumeBtn) {
    return state.extractionSourceLock === "portfolio";
  }
  if (button === appElements.extractPortfolioBtn) {
    return state.extractionSourceLock === "resume";
  }
  return false;
}

function updateExtractionLockUI() {
  const resumeLocked = state.extractionSourceLock === "portfolio";
  const portfolioLocked = state.extractionSourceLock === "resume";

  if (state.extractionSourceLock) {
    setQuickExtractSource(state.extractionSourceLock);
  }

  if (appElements.selectSourceResumeBtn) {
    appElements.selectSourceResumeBtn.disabled = resumeLocked;
    appElements.selectSourceResumeBtn.setAttribute("aria-disabled", String(resumeLocked));
  }

  if (appElements.selectSourcePortfolioBtn) {
    appElements.selectSourcePortfolioBtn.disabled = portfolioLocked;
    appElements.selectSourcePortfolioBtn.setAttribute("aria-disabled", String(portfolioLocked));
  }

  if (appElements.selectResumeBtn) {
    appElements.selectResumeBtn.disabled = resumeLocked;
    appElements.selectResumeBtn.setAttribute("aria-disabled", String(resumeLocked));
  }

  if (appElements.extractResumeBtn && !appElements.extractResumeBtn.classList.contains("is-loading")) {
    appElements.extractResumeBtn.disabled = resumeLocked;
    appElements.extractResumeBtn.setAttribute("aria-disabled", String(resumeLocked));
  }

  if (appElements.extractPortfolioBtn && !appElements.extractPortfolioBtn.classList.contains("is-loading")) {
    appElements.extractPortfolioBtn.disabled = portfolioLocked;
    appElements.extractPortfolioBtn.setAttribute("aria-disabled", String(portfolioLocked));
  }

  if (appElements.resumeFileInput) {
    appElements.resumeFileInput.disabled = resumeLocked;
  }

  if (appElements.portfolioUrlInput) {
    appElements.portfolioUrlInput.disabled = portfolioLocked;
  }

  if (portfolioLocked) {
    setPortfolioStatus("Locked to file source. Delete all answers to switch extraction source.");
  }

  if (resumeLocked) {
    setResumeStatus("Locked to link source. Delete all answers to switch extraction source.");
  }
}

function setExtractButtonState(button, status) {
  if (!button) return;

  button.classList.remove("is-loading", "is-success");
  button.removeAttribute("aria-busy");
  button.disabled = isExtractionButtonLocked(button);

  if (button._successTimer) {
    window.clearTimeout(button._successTimer);
    button._successTimer = null;
  }

  if (status === "loading") {
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.disabled = true;
    return;
  }

  if (status === "success") {
    button.classList.add("is-success");
    button._successTimer = window.setTimeout(() => {
      button.classList.remove("is-success");
      button._successTimer = null;
    }, 1900);
  }
}

async function requestAiResumeExtraction(file) {
  const payload = new FormData();
  payload.append("resume", file);

  let response;
  try {
    response = await fetchApiWithFallback("/api/extract/resume", {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    throw new Error("Cannot reach AI extraction server. Start the backend and try again.");
  }

  const parsed = await parseApiJson(response);
  if (!parsed.profile || typeof parsed.profile !== "object") {
    throw new Error("AI response did not include a valid profile object.");
  }
  return normalizeIncomingProfile(parsed.profile);
}

async function requestAiPortfolioExtraction(url) {
  let response;
  try {
    response = await fetchApiWithFallback("/api/extract/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
  } catch (error) {
    throw new Error("Cannot reach AI extraction server. Start the backend and try again.");
  }

  const parsed = await parseApiJson(response);
  if (!parsed.profile || typeof parsed.profile !== "object") {
    throw new Error("AI response did not include a valid profile object.");
  }
  return normalizeIncomingProfile(parsed.profile);
}

async function parseApiJson(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    if (!response.ok) {
      throw new Error(`Extraction request failed (${response.status}).`);
    }
    throw new Error("Invalid JSON response from extraction API.");
  }

  if (!response.ok) {
    const errorMessage = payload && (payload.error || payload.message);
    throw new Error(errorMessage || `Extraction request failed (${response.status}).`);
  }

  return payload;
}

function normalizeWebUrl(rawUrl) {
  const cleaned = String(rawUrl || "").trim();
  if (!cleaned) {
    throw new Error("Please enter your portfolio URL first.");
  }

  const normalized = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (error) {
    throw new Error("Please enter a valid portfolio URL.");
  }

  if (!/^https?:$/i.test(parsed.protocol)) {
    throw new Error("Only http/https portfolio URLs are supported.");
  }

  if (isPrivateOrLocalHostname(parsed.hostname)) {
    throw new Error("Private or local network URLs are not supported.");
  }

  return parsed.toString();
}

function resolveApiBases() {
  const bases = [""];

  try {
    const protocol = window.location.protocol || "http:";
    const port = window.location.port || "3000";
    const localhostBase = `${protocol}//localhost:${port}`;
    const loopbackBase = `${protocol}//127.0.0.1:${port}`;
    const host = String(window.location.hostname || "").toLowerCase();
    const params = new URLSearchParams(window.location.search);

    if (params.has("serverWindowId")) {
      bases.push(localhostBase, loopbackBase);
    }

    if (host === "127.0.0.1") {
      bases.push(localhostBase);
    }

    if (host === "localhost") {
      bases.push(loopbackBase);
    }
  } catch (error) {
    return [""];
  }

  return Array.from(new Set(bases));
}

function buildApiUrl(base, endpointPath) {
  return base ? `${base}${endpointPath}` : endpointPath;
}

async function fetchApiWithFallback(endpointPath, options) {
  let lastError = null;

  for (const base of API_BASE_CANDIDATES) {
    const requestUrl = buildApiUrl(base, endpointPath);
    try {
      const response = await fetch(requestUrl, options);
      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`Endpoint not available at ${requestUrl}`);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Cannot reach AI extraction server. Start the backend and try again.");
}

async function extractTextFromPortfolioUrl(url) {
  try {
    const directText = await fetchPortfolioContentDirect(url);
    if (directText.trim()) {
      return directText;
    }
  } catch (error) {
    // Ignore direct-fetch errors and try proxy fallback.
  }

  return fetchPortfolioContentViaProxy(url);
}

async function fetchPortfolioContentDirect(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Direct fetch failed (${response.status}).`);
  }

  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    const data = await response.json();
    return normalizeResumeText(JSON.stringify(data));
  }

  const rawText = await response.text();
  if (contentType.includes("text/html") || /<html|<body|<main/i.test(rawText)) {
    return htmlToReadableText(rawText);
  }
  return normalizeResumeText(rawText);
}

async function fetchPortfolioContentViaProxy(url) {
  const target = url.replace(/^https?:\/\//i, "");
  const candidates = [`https://r.jina.ai/http://${target}`, `https://r.jina.ai/https://${target}`];

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) {
        throw new Error(`Proxy returned ${response.status}`);
      }
      const text = await response.text();
      const normalized = normalizeResumeText(text);
      if (normalized) {
        return normalized;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw new Error(`Portfolio fetch failed. ${lastError.message}`);
  }
  throw new Error("Portfolio fetch failed.");
}

function htmlToReadableText(html) {
  if (typeof DOMParser === "undefined") {
    return normalizeResumeText(String(html || "").replace(/<[^>]+>/g, " "));
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html || ""), "text/html");
  doc.querySelectorAll("script,style,noscript,svg,canvas").forEach((node) => node.remove());

  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "";
  const headings = Array.from(doc.querySelectorAll("h1, h2, h3"))
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .slice(0, 80)
    .join("\n");
  const bodyText = doc.body ? doc.body.innerText : doc.documentElement?.textContent || "";

  return normalizeResumeText([title, description, headings, bodyText].filter(Boolean).join("\n")).slice(0, 80000);
}

function extractProfileFromPortfolioText(rawText, portfolioUrl = "") {
  const text = normalizeResumeText(rawText);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections = extractPortfolioSections(lines);
  const extracted = extractProfileFromResumeText(text);

  if (portfolioUrl && !isMeaningfulValue(extracted.identity.socials.website)) {
    extracted.identity.socials.website = portfolioUrl;
  }

  const summaryText = [sections.about, sections.summary].filter(Boolean).join(" ");
  if (summaryText) {
    const compactSummary = compressSectionText(summaryText);
    extracted.identity.background = compactSummary;
    extracted.context.currentFocus = compactSummary;
  }

  if (sections.projects) {
    const compactProjects = compressSectionText(sections.projects);
    extracted.experience.projects.portfolioHighlight = compactProjects;
    if (!isMeaningfulValue(extracted.experience.projects.studentProjects)) {
      extracted.experience.projects.studentProjects = compactProjects;
    }
  }

  if (sections.skills) {
    const compactSkills = compressSectionText(sections.skills);
    extracted.capability.coreSkills = compactSkills;
    extracted.capability.activeSkills = compactSkills;
  }

  if (sections.services) {
    extracted.capability.strengths = compressSectionText(sections.services);
  }

  if (sections.experience) {
    extracted.experience.work.recentImpact = compressSectionText(sections.experience);
  }

  if (sections.education && !isMeaningfulValue(extracted.experience.education.program)) {
    extracted.experience.education.program = firstSectionLine(sections.education);
  }

  if (sections.contact) {
    const contactEmail = firstRegexMatch(sections.contact, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const contactPhone = firstRegexMatch(sections.contact, /(\+?\d[\d\s().-]{7,}\d)/i);
    if (contactEmail) extracted.identity.contact.email = contactEmail;
    if (contactPhone) extracted.identity.contact.phone = sanitizePhone(contactPhone);
  }

  const urls = extractUrls(text);
  const socials = mapSocialUrls(urls);
  extracted.identity.socials.linkedin = socials.linkedin || extracted.identity.socials.linkedin;
  extracted.identity.socials.github = socials.github || extracted.identity.socials.github;
  extracted.identity.socials.twitter = socials.twitter || extracted.identity.socials.twitter;
  extracted.identity.socials.instagram = socials.instagram || extracted.identity.socials.instagram;
  extracted.identity.socials.website = socials.website || extracted.identity.socials.website;

  if (!isMeaningfulValue(extracted.identity.fullName)) {
    const guessedName = guessName(lines);
    if (guessedName) {
      extracted.identity.fullName = guessedName;
      extracted.identity.preferredName = guessedName.split(" ")[0];
    }
  }

  extracted.context.primaryRole = classifyPathFromText(
    `${text} ${sections.services || ""} ${sections.experience || ""} ${sections.projects || ""}`
  );

  return extracted;
}

function extractPortfolioSections(lines) {
  const sections = { header: [] };
  let currentKey = "header";

  lines.forEach((line) => {
    const key = portfolioSectionKeyForLine(line);
    if (key) {
      currentKey = key;
      if (!sections[currentKey]) sections[currentKey] = [];
      return;
    }

    if (!sections[currentKey]) sections[currentKey] = [];
    sections[currentKey].push(line);
  });

  return Object.fromEntries(
    Object.entries(sections).map(([key, values]) => [key, values.join("\n").trim()])
  );
}

function portfolioSectionKeyForLine(line) {
  const normalized = String(line || "")
    .replace(/[:|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized || normalized.length > 48) return "";

  for (const matcher of PORTFOLIO_SECTION_MATCHERS) {
    if (matcher.regex.test(normalized)) {
      return matcher.key;
    }
  }
  return "";
}

async function extractTextFromResumeFile(file) {
  const extension = getFileExtension(file.name);
  const fileType = file.type || "";
  if (extension === "pdf" || fileType === "application/pdf") {
    return extractTextFromPdf(file);
  }
  if (extension === "docx") {
    return extractTextFromDocx(file);
  }
  if (extension === "txt" || extension === "md" || fileType.startsWith("text/")) {
    return file.text();
  }
  throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
}

async function extractTextFromPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF parser is not available.");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdfDocument = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  return pages.join("\n");
}

async function extractTextFromDocx(file) {
  if (!window.mammoth || typeof window.mammoth.extractRawText !== "function") {
    throw new Error("DOCX parser is not available.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
}

function getFileExtension(fileName) {
  const parts = String(fileName || "").toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function extractProfileFromResumeText(rawText) {
  const text = normalizeResumeText(rawText);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections = extractResumeSections(lines);

  const extracted = cloneProfileTemplate();
  const email = firstRegexMatch(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phone = firstRegexMatch(text, /(\+?\d[\d\s().-]{7,}\d)/i);
  const urls = extractUrls(text);
  const socials = mapSocialUrls(urls);

  if (email) extracted.identity.contact.email = email;
  if (phone) extracted.identity.contact.phone = sanitizePhone(phone);

  extracted.identity.socials.linkedin = socials.linkedin || "";
  extracted.identity.socials.github = socials.github || "";
  extracted.identity.socials.twitter = socials.twitter || "";
  extracted.identity.socials.instagram = socials.instagram || "";
  extracted.identity.socials.website = socials.website || "";

  const guessedName = guessName(lines);
  if (guessedName) {
    extracted.identity.preferredName = guessedName.split(" ")[0];
    extracted.identity.fullName = guessedName;
  }

  const guessedLocation = guessLocation(lines, text);
  if (guessedLocation) {
    extracted.identity.location = guessedLocation;
  }

  const summaryText = [sections.summary, sections.objective].filter(Boolean).join(" ");
  if (summaryText) {
    extracted.identity.background = summaryText;
    extracted.context.currentFocus = summaryText;
  }

  if (sections.skills) {
    const compactSkills = compressSectionText(sections.skills);
    extracted.capability.coreSkills = compactSkills;
    extracted.capability.activeSkills = compactSkills;
  }

  if (sections.experience) {
    extracted.experience.work.recentImpact = compressSectionText(sections.experience);
    const roleHint = findRoleHint(sections.experience);
    if (roleHint) {
      extracted.experience.work.currentRole = roleHint;
    }
  }

  if (sections.education) {
    const educationPreview = firstSectionLine(sections.education);
    extracted.experience.education.program = educationPreview;
    extracted.experience.education.year = firstRegexMatch(
      sections.education,
      /(20\d{2}|19\d{2}|first|second|third|fourth|semester\s*\d+)/i
    );
  }

  if (sections.projects) {
    extracted.experience.projects.portfolioHighlight = compressSectionText(sections.projects);
    extracted.experience.projects.studentProjects = compressSectionText(sections.projects);
  }

  if (sections.achievements) {
    extracted.experience.proudMoment = compressSectionText(sections.achievements);
  }

  const detectedPath = classifyPathFromText(`${summaryText} ${sections.experience || ""} ${sections.education || ""}`);
  extracted.context.primaryRole = detectedPath;

  const shortGoalHint = firstRegexMatch(text, /(seeking|aiming|looking for|goal)\s+[^\n.]{12,}/i);
  if (shortGoalHint) {
    extracted.intent.shortTerm = shortGoalHint;
  }

  return extracted;
}

function normalizeResumeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractResumeSections(lines) {
  const sections = { header: [] };
  let currentKey = "header";

  lines.forEach((line) => {
    const key = sectionKeyForLine(line);
    if (key) {
      currentKey = key;
      if (!sections[currentKey]) sections[currentKey] = [];
      return;
    }

    if (!sections[currentKey]) sections[currentKey] = [];
    sections[currentKey].push(line);
  });

  return Object.fromEntries(
    Object.entries(sections).map(([key, values]) => [key, values.join("\n").trim()])
  );
}

function sectionKeyForLine(line) {
  const normalized = String(line || "")
    .replace(/[:|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "";

  for (const matcher of RESUME_SECTION_MATCHERS) {
    if (matcher.regex.test(normalized)) {
      return matcher.key;
    }
  }
  return "";
}

function compressSectionText(sectionText) {
  return String(sectionText || "")
    .split("\n")
    .map((line) => line.trim().replace(/^[\-*\u2022]\s*/, ""))
    .filter(Boolean)
    .join(" | ")
    .slice(0, 900);
}

function firstSectionLine(sectionText) {
  return String(sectionText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0] || "";
}

function extractUrls(text) {
  const matches = String(text || "").match(/(?:https?:\/\/|www\.)[^\s<>()]+/gi);
  if (!matches) return [];

  return matches
    .map((value) => value.replace(/[),.;]+$/, ""))
    .map((value) => (value.startsWith("http") ? value : `https://${value}`));
}

function mapSocialUrls(urls) {
  const socials = {
    linkedin: "",
    github: "",
    twitter: "",
    instagram: "",
    website: "",
  };

  urls.forEach((url) => {
    const lower = url.toLowerCase();
    if (!socials.linkedin && lower.includes("linkedin.com")) {
      socials.linkedin = url;
      return;
    }
    if (!socials.github && lower.includes("github.com")) {
      socials.github = url;
      return;
    }
    if (!socials.twitter && (lower.includes("twitter.com") || lower.includes("x.com"))) {
      socials.twitter = url;
      return;
    }
    if (!socials.instagram && lower.includes("instagram.com")) {
      socials.instagram = url;
      return;
    }
    if (!socials.website) {
      socials.website = url;
    }
  });

  return socials;
}

function firstRegexMatch(text, regex) {
  const result = String(text || "").match(regex);
  if (!result || !result[0]) return "";
  return result[0].trim();
}

function sanitizePhone(phoneText) {
  return String(phoneText || "")
    .replace(/\s+/g, " ")
    .replace(/[^\d+()\-\s]/g, "")
    .trim();
}

function guessName(lines) {
  const blacklist = /resume|curriculum|vitae|linkedin|github|phone|email|address|profile|summary|objective/i;
  for (const line of lines.slice(0, 8)) {
    if (blacklist.test(line)) continue;
    if (/\d/.test(line)) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4 && words.every((word) => /^[A-Za-z.'-]+$/.test(word))) {
      return words.join(" ");
    }
  }
  return "";
}

function guessLocation(lines, text) {
  const explicitLocation = lines.find((line) => /^location\s*[:|-]/i.test(line));
  if (explicitLocation) {
    return explicitLocation.replace(/^location\s*[:|-]\s*/i, "").trim();
  }

  const locationMatch = firstRegexMatch(
    text,
    /(new york|london|berlin|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|pune|remote|india|usa|united states|canada|uae|singapore)/i
  );
  return locationMatch;
}

function findRoleHint(experienceSection) {
  const firstLine = firstSectionLine(experienceSection);
  if (/intern|engineer|developer|designer|analyst|manager|consultant|founder|freelancer|student/i.test(firstLine)) {
    return firstLine;
  }
  return "";
}

function classifyPathFromText(text) {
  const input = String(text || "").toLowerCase();
  if (/(student|semester|btech|university|college|school|internship)/i.test(input)) return "student";
  if (/(freelance|client|contract|independent|consultant)/i.test(input)) return "freelancer";
  if (/(founder|startup|cofounder|venture)/i.test(input)) return "founder";
  if (/(professional|company|manager|employee|career|analyst|engineer|developer|designer)/i.test(input)) {
    return "professional";
  }
  return "explorer";
}

function cleanString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeIncomingProfile(candidate) {
  const normalized = cloneProfileTemplate();
  const source = candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : {};

  mergeKnownProfileKeys(normalized, source);

  normalized.identity.languages = normalizeStringArray(normalized.identity.languages);
  normalized.identity.contact.email = normalizeEmailAddress(normalized.identity.contact.email);
  normalized.identity.contact.phone = normalizePhoneNumber(normalized.identity.contact.phone);

  normalized.identity.socials.linkedin = normalizeSocialUrl("linkedin", normalized.identity.socials.linkedin);
  normalized.identity.socials.github = normalizeSocialUrl("github", normalized.identity.socials.github);
  normalized.identity.socials.twitter = normalizeSocialUrl("twitter", normalized.identity.socials.twitter);
  normalized.identity.socials.instagram = normalizeSocialUrl("instagram", normalized.identity.socials.instagram);
  normalized.identity.socials.website = normalizeSocialUrl("website", normalized.identity.socials.website);

  normalized.context.primaryRole = normalizePrimaryRole(normalized.context.primaryRole || normalized.meta.profilePath);
  normalized.meta.profilePath = normalized.context.primaryRole;
  normalized.meta.depthMode = normalized.meta.depthMode === "deep" ? "deep" : "light";

  const ratio = Number(normalized.meta.completionRatio);
  if (!Number.isFinite(ratio)) {
    normalized.meta.completionRatio = 0;
  } else {
    normalized.meta.completionRatio = Math.max(0, Math.min(1, Number(ratio.toFixed(2))));
  }

  normalized.meta.lastUpdated = new Date().toISOString();

  return normalized;
}

function mergeKnownProfileKeys(target, source) {
  if (!target || !source || typeof source !== "object") return;

  Object.keys(target).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue)) {
      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue.map((entry) => cleanString(entry)).filter(Boolean);
      } else if (typeof sourceValue === "string") {
        target[key] = normalizeStringArray(sourceValue);
      }
      return;
    }

    if (targetValue && typeof targetValue === "object") {
      if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
        mergeKnownProfileKeys(targetValue, sourceValue);
      }
      return;
    }

    const cleaned = cleanString(sourceValue);
    if (cleaned) {
      target[key] = cleaned;
    }
  });
}

function normalizeStringArray(value) {
  const list = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/[\n,;|/]+/)
        .map((entry) => entry.trim());

  const seen = new Set();
  return list
    .map((entry) => cleanString(entry))
    .filter((entry) => {
      if (!entry) return false;
      const lower = entry.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

function normalizePrimaryRole(role) {
  const value = String(role || "").toLowerCase();
  return pathLabels[value] ? value : "explorer";
}

function normalizeEmailAddress(value) {
  const email = cleanString(value).toLowerCase();
  if (!email) return "";
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) ? email : "";
}

function normalizePhoneNumber(value) {
  const compact = cleanString(value)
    .replace(/[^\d+()\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const digits = compact.replace(/\D/g, "").length;
  return digits >= 8 ? compact : "";
}

function normalizeSocialUrl(field, value) {
  const cleaned = cleanString(value);
  if (!cleaned) return "";

  if (field === "twitter" && /^@[A-Za-z0-9_]{1,15}$/.test(cleaned)) {
    return `https://x.com/${cleaned.slice(1)}`;
  }

  if (field === "github" && /^[A-Za-z0-9-]{1,39}$/.test(cleaned) && !cleaned.includes(".")) {
    return `https://github.com/${cleaned}`;
  }

  if (field === "instagram" && /^@?[A-Za-z0-9_.]{1,30}$/.test(cleaned) && !cleaned.includes("/")) {
    return `https://instagram.com/${cleaned.replace(/^@/, "")}`;
  }

  if (field === "linkedin" && /^[A-Za-z0-9-]{3,100}$/.test(cleaned) && !cleaned.includes(".")) {
    return `https://www.linkedin.com/in/${cleaned}`;
  }

  const urlValue = normalizeHttpUrl(cleaned);
  if (!urlValue) return "";

  let host = "";
  try {
    host = new URL(urlValue).hostname.toLowerCase();
  } catch (error) {
    return "";
  }

  if (field === "linkedin" && !hostMatches(host, ["linkedin.com", "lnkd.in"])) return "";
  if (field === "github" && !hostMatches(host, ["github.com"])) return "";
  if (field === "twitter" && !hostMatches(host, ["twitter.com", "x.com"])) return "";
  if (field === "instagram" && !hostMatches(host, ["instagram.com"])) return "";

  return urlValue;
}

function normalizeHttpUrl(value) {
  const cleaned = cleanString(value).replace(/[),.;:!?]+$/g, "");
  if (!cleaned) return "";

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

  if (isPrivateOrLocalHostname(parsed.hostname)) {
    return "";
  }

  parsed.hash = "";
  return parsed.toString();
}

function hostMatches(hostname, domains) {
  const host = String(hostname || "").toLowerCase();
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function isPrivateOrLocalHostname(hostname) {
  const host = String(hostname || "").trim().toLowerCase();
  if (!host) return true;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal")
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4) {
    const [a, b] = host.split(".").map((part) => Number(part));
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }

  if (host.includes(":")) {
    const normalized = host.replace(/^\[|\]$/g, "");
    if (normalized === "::1" || normalized.startsWith("fe80") || normalized.startsWith("fc") || normalized.startsWith("fd")) {
      return true;
    }
  }

  return false;
}

function mergeProfileWithoutOverwriting(target, source) {
  if (!source || typeof source !== "object") return;

  Object.entries(source).forEach(([key, sourceValue]) => {
    if (!(key in target)) return;

    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        return;
      }
      mergeProfileWithoutOverwriting(target[key], sourceValue);
      return;
    }

    if (!isMeaningfulValue(sourceValue)) return;

    if (!isMeaningfulValue(target[key])) {
      target[key] = Array.isArray(sourceValue) ? [...sourceValue] : sourceValue;
    }
  });
}

function syncAnswersFromProfile() {
  const nextAnswers = {};
  const nextOrder = [];

  Object.values(QUESTION_INDEX).forEach((question) => {
    const value = getAtPath(state.profile, question.mapsTo);
    if (isMeaningfulValue(value)) {
      nextAnswers[question.id] = value;
      nextOrder.push(question.id);
    }
  });

  state.answers = nextAnswers;
  state.answerOrder = nextOrder;
}

function findNextPendingIndex(startIndex) {
  for (let i = Math.max(0, startIndex); i < state.flow.length; i += 1) {
    const question = state.flow[i];
    if (!isAnswered(question.id) && !state.skipped.has(question.id)) {
      return i;
    }
  }
  return -1;
}

function isAnswered(questionId) {
  return Object.prototype.hasOwnProperty.call(state.answers, questionId) && isMeaningfulValue(state.answers[questionId]);
}

function updateCompletionMeta() {
  const total = state.flow.length || 1;
  const completed = state.flow.filter((q) => isAnswered(q.id) || state.skipped.has(q.id)).length;
  state.profile.meta.completionRatio = Number((completed / total).toFixed(2));
  state.profile.meta.lastUpdated = new Date().toISOString();
}

function pulseShift() {
  appElements.app.classList.add("slide-pulse");
  window.setTimeout(() => {
    appElements.app.classList.remove("slide-pulse");
  }, 340);
}

function inputMarkup(question, value, prefix) {
  const safeValue = value === undefined || value === null ? "" : value;
  const fieldId = `${prefix}-field-${question.id}`;

  if (question.type === "textarea") {
    return `<textarea id="${fieldId}" placeholder="${escapeHtml(question.placeholder || "Type your answer")}">${escapeHtml(
      String(safeValue)
    )}</textarea>`;
  }

  if (question.type === "select") {
    const options = (question.options || [])
      .map((option) => {
        const selected = String(option.value) === String(safeValue) ? "selected" : "";
        return `<option value="${escapeHtml(option.value)}" ${selected}>${escapeHtml(option.label)}</option>`;
      })
      .join("");
    return `<select id="${fieldId}" class="select-control">${options}</select>`;
  }

  if (question.type === "multiselect") {
    const selected = Array.isArray(safeValue) ? safeValue : [];
    const checks = (question.options || [])
      .map((option) => {
        const checked = selected.includes(option.value) ? "checked" : "";
        return `
          <label class="check-item">
            <input type="checkbox" name="${fieldId}-multi" value="${escapeHtml(option.value)}" ${checked} />
            <span>${escapeHtml(option.label)}</span>
          </label>
        `;
      })
      .join("");
    return `<div id="${fieldId}" class="multiselect">${checks}</div>`;
  }

  const inputType = ["email", "tel", "date"].includes(question.type) ? question.type : "text";
  return `<input id="${fieldId}" class="text-control" type="${inputType}" value="${escapeHtml(
    String(safeValue)
  )}" placeholder="${escapeHtml(question.placeholder || "Type your answer")}" />`;
}

function readInputValue(question, prefix) {
  const fieldId = `${prefix}-field-${question.id}`;
  if (question.type === "multiselect") {
    return Array.from(document.querySelectorAll(`input[name='${fieldId}-multi']:checked`)).map((input) => input.value);
  }

  const field = document.getElementById(fieldId);
  if (!field) return "";
  return field.value;
}

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
  }
  return String(value || "").trim();
}

function isEmptyValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  return String(value || "").trim().length === 0;
}

function isMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).some((entry) => isMeaningfulValue(entry));
  }
  return String(value || "").trim().length > 0;
}

function flattenToLabelValuePairs(obj, prefix = "") {
  if (!obj || typeof obj !== "object") return [];

  return Object.entries(obj).flatMap(([key, value]) => {
    const label = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value) || typeof value !== "object" || value === null) {
      return [{ label: prettifyKey(label), value }];
    }
    return flattenToLabelValuePairs(value, label);
  });
}

function valueToReadableString(value) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function prettifyKey(path) {
  return path
    .split(".")
    .map((part) => part.replace(/([A-Z])/g, " $1"))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" -> ");
}

function setAtPath(target, path, value) {
  const parts = path.split(".");
  let pointer = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!pointer[key] || typeof pointer[key] !== "object") {
      pointer[key] = {};
    }
    pointer = pointer[key];
  }
  pointer[parts[parts.length - 1]] = value;
}

function getAtPath(target, path) {
  const parts = path.split(".");
  let pointer = target;
  for (const key of parts) {
    if (!pointer || typeof pointer !== "object" || !(key in pointer)) {
      return undefined;
    }
    pointer = pointer[key];
  }
  return pointer;
}

function clearAtPath(target, path) {
  const parts = path.split(".");
  let pointer = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!pointer[key] || typeof pointer[key] !== "object") {
      return;
    }
    pointer = pointer[key];
  }
  const leaf = parts[parts.length - 1];
  if (!(leaf in pointer)) return;

  if (Array.isArray(pointer[leaf])) {
    pointer[leaf] = [];
  } else {
    pointer[leaf] = "";
  }
}

function cloneProfileTemplate() {
  return JSON.parse(JSON.stringify(PROFILE_TEMPLATES));
}

function indexQuestions() {
  const index = {};
  Object.values(QUESTION_SETS).forEach((list) => {
    list.forEach((question) => {
      index[question.id] = question;
    });
  });
  return index;
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
