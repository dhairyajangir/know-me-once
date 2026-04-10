# Adaptive Human Model — Biodata Extraction Tool

A web app to collect human context through adaptive questions and generate a structured JSON profile using deterministic + AI-assisted extraction.

---

## Quick Start

```bash
npm install
echo GEMINI_API_KEY=your_key > .env
npm run dev
```

Open: `http://localhost:3000`

---

## What It Does

* Adaptive question flow based on user type
* Resume and portfolio extraction
* Deterministic parsing:

  * email, phone, URLs, socials
* AI-assisted structuring (Gemini)
* Editable JSON output

---

## Core Features

| Feature       | Description                      |
| ------------- | -------------------------------- |
| Adaptive Flow | Questions adjust to user profile |
| Extraction    | Resume + portfolio parsing       |
| Validation    | Schema-safe JSON                 |
| Fallback      | Works without AI (heuristics)    |
| Control       | Edit answers and JSON            |

---

## API

| Method | Endpoint                 | Purpose             |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/health`            | Health check        |
| POST   | `/api/extract/resume`    | Extract from resume |
| POST   | `/api/extract/portfolio` | Extract from URL    |

---

## Scripts

| Command                   | Purpose             |
| ------------------------- | ------------------- |
| `npm run dev`             | Start dev server    |
| `npm test`                | Run tests           |
| `npm run test:regression` | Regression tests    |
| `npm run harness`         | Accuracy evaluation |

---

## Data Model

```
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

## Notes

* Requires `GEMINI_API_KEY` for AI extraction
* Falls back to heuristic extraction if unavailable
* No persistent storage (session-based)

---

## License

MIT License

