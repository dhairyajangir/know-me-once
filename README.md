# Adaptive Human Model - Biodata Extraction Tool

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

A structured, trust-driven web application for capturing human context through a guided session and generating a normalized JSON profile.

The system focuses on accuracy, speed, and deterministic extraction, with fallback to model-assisted parsing where necessary.

## TL;DR Quickstart

```bash
npm install
echo GEMINI_API_KEY=your_key> .env
npm run dev
```

Open `http://localhost:3000`, choose input mode, extract or fill manually, then review/edit JSON in the right panel.

---

## Overview

This application collects user data through an adaptive question flow and supports automated extraction from resumes and portfolio URLs.

It combines:

- deterministic signal extraction (emails, phones, URLs)
- schema-safe normalization
- AI-assisted parsing (Gemini)
- regression-tested pipelines
- measurable accuracy via evaluation harness

---

## Core Features

### Adaptive Question Flow

- Dynamically adjusts based on user type:
  - Student
  - Working professional
  - Freelancer
  - Founder
  - Explorer / unsure
- Depth control based on engagement level
- Skip support for all questions

---

### Extraction Pipeline

- Resume parsing (text-based)
- Portfolio URL scraping (server-side)
- Deterministic extraction:
  - Emails
  - Phone numbers
  - URLs
  - Social links
- AI-assisted structuring using Gemini
- Heuristic fallback if model is unavailable

---

### Data Integrity

- Schema-safe JSON normalization
- Malformed JSON recovery
- Private/local URL rejection
- Controlled merge of extracted + user-provided data

---

### User Control

- Edit or delete any answer
- Direct JSON editing
- Re-apply structured data
- Dual view:
  - Human-readable profile
  - Raw JSON structure

---

## System Architecture

| Layer | Responsibility |
| --- | --- |
| Frontend | Guided UI, adaptive questioning |
| Backend (Node.js) | Extraction, validation, AI calls |
| Extraction Engine | Heuristic + model blending |
| Validation Layer | Schema enforcement |
| Testing Layer | Regression + accuracy evaluation |

---

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
GEMINI_API_KEY=your_key
```

### 3. Start the server

```bash
npm run dev
```

### 4. Access the app

```text
http://localhost:3000
```

---

## Usage

1. Select input method:
   - Manual entry
   - Resume upload
   - Portfolio URL
2. Run extraction (if applicable)
3. Complete guided questions
4. Review and refine:
   - Profile view
   - JSON output

Note:

- Only one extraction source can be active at a time
- Reset using Delete all answers

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:regression` | Run regression tests |
| `npm run harness` | Run accuracy evaluation |
| `npm run harness:tune` | Run tuning mode |

---

## Backend API

| Method | Endpoint | Purpose | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | Service health check | None | `{ ok, model }` |
| `POST` | `/api/preview/resume` | Extract preview text from uploaded resume | `multipart/form-data` with `resume` file | `{ fileName, mimeType, size, textPreview, truncated }` |
| `POST` | `/api/extract/resume` | Extract structured profile from resume | `multipart/form-data` with `resume` file | `{ profile, source, model, extractionMode, cached, latencyMs }` |
| `POST` | `/api/extract/portfolio` | Extract structured profile from portfolio URL | JSON: `{ "url": "https://..." }` | `{ profile, source, model, extractionMode, cached, latencyMs }` |

Common error response:

```json
{ "error": "human-readable message" }
```

---

## Regression Testing

Run:

```bash
npm run test:regression
```

Coverage includes:

- URL extraction false positives
- JSON parsing failures
- Private/local URL filtering
- Model output inconsistencies

---

## Accuracy Evaluation

Run:

```bash
npm run harness
```

Metrics:

- Precision
- Recall
- F1 Score

### Tuning Mode

```bash
npm run harness:tune
```

- Enables heuristic + model blending
- Requires valid `GEMINI_API_KEY`
- Falls back to heuristic-only evaluation if unavailable

### Optional Flags

| Flag | Description |
| --- | --- |
| `--corpus` | Custom dataset path |
| `--out` | Output report path |
| `--fields` | Evaluate specific fields |

### Example

```bash
node tools/accuracy-harness.js \
--corpus tools/corpus/labeled-samples.json \
--fields identity.contact.email,identity.socials.linkedin
```

---

## Corpus Format

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

---

## Output Report

Generated at:

```text
.reports/accuracy-report.json
```

Includes:

- Best configuration
- Micro metrics (precision, recall, F1)
- Macro F1
- Per-field performance
- Error analysis
- Sample mismatches

---

## Data Model

```text
identity
capability
experience
intent
behavior
preferences
context
meta
```

---

## Adaptive Logic

The system adjusts questioning based on:

- user role classification
- response depth
- engagement signals

### Example Flows

Student:

- academic details
- projects
- skills
- internship goals

Professional:

- role and experience
- impact
- career progression
- leadership signals

Explorer:

- interests
- experiments
- blockers
- short-term direction

---

## Notes

- Sensitive fields are optional
- Resume parsing is server-side
- Portfolio extraction is sanitized before processing
- AI extraction requires backend + API key
- Heuristic fallback ensures partial functionality without AI

---

## Limitations

- No persistent storage (session-based)
- Extraction quality depends on input quality
- Portfolio parsing varies across websites

---

## License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for full text.
