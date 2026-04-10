# 🎗️ CancerShield AI

### AI-Powered Early Breast Cancer Screening Assistant

> **Hackathon-ready** · Computer Vision + LLM · Full-Stack · Zero-crash architecture

---

## 📋 Overview

CancerShield AI is a full-stack web application that analyzes medical images for breast cancer risk using a mock CNN model and provides intelligent, compassionate explanations via OpenRouter's LLM API (Mistral/Llama).

**Core flow:**

```
Upload Image → AI Prediction → LLM Explanation → Result Page → Chat Assistant → PDF Report
```

---

## 🗂️ Project Structure

```
breast-cancer-screening/
│
├── backend/
│   ├── app.py                  # Flask API (predict, chat, health)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx             # Router + context (auth, dark mode, lang)
│       ├── main.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── Landing.jsx     # Hero page with feature showcase
│       │   ├── Auth.jsx        # Login / Signup (localStorage)
│       │   ├── Dashboard.jsx   # Drag-drop upload + patient form
│       │   ├── Results.jsx     # Risk display + chat + PDF export
│       │   └── History.jsx     # Past scans browser
│       └── components/
│           └── Navbar.jsx      # Dark mode, lang toggle, auth controls
│
└── README.md
```

---

## ⚡ Quick Start (Windows)

### Step 1 — Backend

Open a terminal:

```cmd
cd breast-cancer-screening\backend
pip install flask flask-cors requests python-dotenv
python app.py
```

### Step 2 — Frontend

Open a **second** terminal:

```cmd
cd breast-cancer-screening\frontend
npm install
npm run dev
```

### Step 3 — Open the app

```
http://localhost:5173
```

---

## 🔧 Environment Variables

### `backend/.env`

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx
PORT=5000
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

> Without the API key the app still works using built-in fallback responses.

---

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/predict` | Image analysis + AI explanation |
| `POST` | `/chat` | Chatbot conversation |

### POST `/predict`

```
Content-Type: multipart/form-data

Fields:
  image       — JPG / PNG / WebP file
  patientData — JSON { age, familyHistory, prevScreenings, symptoms }

Response:
  {
    "risk": "Low" | "Medium" | "High",
    "probability": 12.4,
    "confidence": 89.2,
    "model_used": "MockCNN-v1",
    "explanation": "...",
    "recommendation": "...",
    "recommendation_level": "routine" | "moderate" | "urgent",
    "disclaimer": "...",
    "timestamp": "..."
  }
```

### POST `/chat`

```json
Request:  { "message": "What does high risk mean?", "history": [] }
Response: { "reply": "...", "timestamp": "..." }
```

---

## 🤖 AI Stack

| Component | Technology |
|-----------|------------|
| Image analysis | Mock CNN (pure Python) |
| LLM explanations | OpenRouter → `mistralai/mistral-7b-instruct:free` |
| Chatbot | OpenRouter, 2-message context window |
| Fallback | Hardcoded safe responses if API unavailable |

---

## ✨ Features

### Core
- 🖼️ Drag-and-drop image upload with live preview
- 🔬 AI risk assessment — Low / Medium / High with probability %
- 💬 LLM explanation — calm, non-alarming, 4-sentence analysis
- 📊 Animated result bars — probability and confidence
- 🤖 Chat assistant — ask follow-up questions in real time
- 📄 PDF report — downloadable with risk, explanation, recommendation
- 🏥 Nearby hospitals — placeholder with ratings

### User Experience
- 🔐 Auth — signup / login / demo account (localStorage)
- 🌙 Dark mode — persisted toggle
- 🇮🇳 Hindi / English language toggle
- 📱 Responsive — mobile-friendly layout
- 🕐 History — view / delete past scans (localStorage)

### Safety
- ✅ Zero-crash — every endpoint has fallback responses
- ⚕️ Disclaimer — "not a medical diagnosis" on every screen
- 🧘 Supportive tone — AI prompts tuned for calm, non-alarming output

---

## 🎨 UI / UX Design

| Element | Detail |
|---------|--------|
| Theme | Soft rose-pink + white medical aesthetic |
| Fonts | Playfair Display (headings) · DM Sans (body) |
| Animations | Framer Motion — page enters, bars, badges, chat bubbles |
| Cards | Glass morphism with subtle shadows |
| Risk colors | 🟢 Low · 🟡 Medium · 🔴 High |

---

## 🔒 Fallback System

| Scenario | Behavior |
|----------|----------|
| API key missing | Uses hardcoded risk-based explanations |
| OpenRouter timeout | Falls back to template responses |
| Invalid image | Returns safe Medium mock result |
| Network error | Frontend catches error and still shows results |

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `can't open file app.py` | Run `cd backend` first |
| Pillow install fails | Use `pip install flask flask-cors requests python-dotenv` only |
| Frontend won't start | Install Node.js from https://nodejs.org |
| No AI explanation | Add `OPENROUTER_API_KEY` to `backend/.env` |

---

## 🚀 Production Deployment

```bash
# Build frontend
cd frontend
npm run build

# Serve from Flask
cd ../backend
gunicorn app:app --bind 0.0.0.0:8000
```

---

## ⚠️ Disclaimer

**CancerShield AI is for educational and informational purposes only.**
It does not provide medical advice, diagnosis, or treatment.
Always consult a qualified healthcare professional for medical decisions.

---

## 📜 License

MIT — Free to use, modify, and distribute for educational purposes.
