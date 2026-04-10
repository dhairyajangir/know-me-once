# Adaptive Human Model Biodata Tool

A minimal, trust-driven web application that captures deep human context in one guided session and outputs a rich, structured JSON profile.

This project now includes a hardened extraction pipeline with:

- deterministic signal extraction (emails, phones, URLs, social links)
- schema-safe JSON normalization
- private/local URL rejection for portfolio fetches
- regression tests for critical edge cases
- corpus-based accuracy evaluation with precision/recall/F1 reporting

## What this app does

- Starts with broad discovery questions.
- Adapts question paths dynamically:
  - Student
  - Working professional
  - Freelancer
  - Founder
  - Explorer / unsure
- Uses trust-first prompts with "Why we ask this" context.
- Supports skip logic and optional sensitive fields.
- Includes social profile questions (LinkedIn, GitHub, website, X/Twitter, Instagram).
- Uses Gemini AI extraction for resumes and portfolio URLs to auto-fill the JSON profile.
- Shows one question at a time for calm conversation flow.
- Smoothly shifts the question panel left as answers progress.
- Reveals a right-side panel with:
  - Human-readable understanding view
  - Editable structured JSON view
- Allows full user control:
  - Edit any answer
  - Delete any answer
  - Edit JSON directly and re-apply

## Run locally

This project now uses a small Node backend for AI extraction.

1. Install dependencies:
  - `npm install`
2. Add your Gemini key in [.env](.env):
  - `GEMINI_API_KEY=your_real_key`
3. Start the app server:
  - `npm run dev`
4. Open:
  - `http://localhost:3000`
5. Optional quick-start import:
  - Use selector: "Fill details manually" or "Extract from resume or portfolio"
  - Resume: click "Choose resume file" to preview it, then click "Extract details from resume".
  - Portfolio: paste URL and click "Extract details from portfolio".
  - To avoid JSON clutter, once one extraction source is used, the other source is locked until you click "Delete all answers".
6. Continue answering and refining questions.
7. Use the right panel to review profile or structured JSON.

## Scripts

Use these scripts during development:

- npm run dev
- npm run start
- npm test
- npm run test:regression
- npm run harness
- npm run harness:tune

## Regression tests

Run the regression suite for extraction edge cases:

```bash
npm run test:regression
```

Current regression coverage includes:

- URL extraction false positives from email domains and abbreviations
- malformed JSON edit handling
- private/local URL rejection
- model JSON parse recovery for fenced/trailing-comma outputs

Run all tests:

```bash
npm test
```

## Accuracy harness

Run corpus-based field evaluation (precision/recall/F1):

```bash
npm run harness
```

Run tuning mode (heuristic/model blend + prompt signal weight):

```bash
npm run harness:tune
```

Note:

- harness:tune uses --with-model, so model blending only occurs when GEMINI_API_KEY is set and reachable.
- if model extraction is unavailable, the harness gracefully evaluates heuristic mode and still produces a report.

Optional flags:

- --corpus <path> custom labeled corpus JSON
- --out <path> output report path (default: .reports/accuracy-report.json)
- --fields a,b,c evaluate only selected field paths

Example:

```bash
node tools/accuracy-harness.js --corpus tools/corpus/labeled-samples.json --fields identity.contact.email,identity.socials.linkedin
```

Corpus examples live in tools/corpus/labeled-samples.json.

### Corpus format

Each sample in the corpus is a JSON object with:

- id: unique sample id
- sourceType: resume or portfolio
- sourceLabel: label for traceability
- text: raw source text used for extraction
- portfolioUrl: optional, typically set for portfolio samples
- expected: map of field path to expected value

Minimal sample:

```json
{
  "id": "resume-1",
  "sourceType": "resume",
  "sourceLabel": "resume-1.txt",
  "text": "Jane Doe\nEmail: jane@example.com",
  "expected": {
    "identity.fullName": "Jane Doe",
    "identity.contact.email": "jane@example.com"
  }
}
```

### Accuracy report output

The harness writes a JSON report to .reports/accuracy-report.json that includes:

- bestConfig
- summary.micro (precision, recall, f1)
- summary.macroF1
- perField metrics and error counts
- sampleResults with mismatch details

Use lowest-performing fields to prioritize extractor and prompt tuning.

## Data model generated

The output is a deep profile object with layers:

- identity
- capability
- experience
- intent
- behavior
- preferences
- context
- meta

## Adaptive behavior implemented

- Dynamic path classification from current focus + selected role.
- Path-specific follow-ups (student/professional/freelancer/founder/explorer).
- Depth control:
  - Engaged, detailed answers trigger deeper questions.
  - Signals like "quick" or "tired" keep session lightweight.
- Skip support for any question.

## Example user journeys

### Journey A: Student

Input signal:
- "I am a 2nd year BTech student preparing for internships"

System adapts to ask:
- Program and year
- Student projects
- Active skills
- Internship target
- Learning style (if depth increases)

### Journey B: Working professional

Input signal:
- "I am working as a data analyst and preparing for a senior role"

System adapts to ask:
- Current role
- Years of experience
- Recent impact
- Next career move
- Leadership/collaboration style (if depth increases)

### Journey C: Explorer / unsure

Input signal:
- "I am not sure yet, exploring options"

System adapts to ask:
- Curiosity areas
- Current experiments
- Direction blockers
- One-month progress target
- Preferred support mode

## Notes

- Sensitive details like phone, email, and date of birth are optional.
- AI extraction requires a running backend server and valid Gemini API key in `.env`.
- Resume text is parsed on the server and sent to Gemini for structured extraction.
- Portfolio extraction fetches page content server-side and sends condensed text to Gemini.
- Extraction falls back to heuristic mode if the model is unavailable or times out.
- Profile data is still stored in-memory in the browser session.
