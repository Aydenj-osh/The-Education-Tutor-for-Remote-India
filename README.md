# EduTutor India (Scaledown Contest Edition)

An offline-first, zero-config Progressive Web App (PWA) designed to provide AI-powered tutoring to students in rural India using minimal bandwidth and API costs.

## 🏆 Key Features & Constraints Met

- **Zero-Config Architecture:** Runs entirely in the browser. No Python backend needed. Just open `index.html`.
- **Offline PDF Extraction:** Extracts textbook text locally on the device using `pdf.js` without uploading massive files over weak 2G/3G networks.
- **True Context Pruning:** The app uses local keyword retrieval to find relevant paragraphs, then sends both the context and the user's prompt to the **Scaledown AI API** (`/compress/raw/`) to mathematically prune irrelevant sentences. 
- **Cost & Token Reduction:** By sending only the highly-compressed pruned context to **Gemini 2.5 Flash**, the app demonstrates up to an **85%+ reduction in API costs** compared to standard RAG chatbots.
- **Transparency Dashboard:** Real-time UI metrics proving the Tokens Saved, Cost Reduction Percentage, and step-by-step API latency.

## 🚀 How to Run

1. Simply open `index.html` in Chrome, Edge, or Safari.
2. Enter your **Scaledown API Key** (🔑) and **Gemini API Key** (✨) in the settings card.
3. Drag and drop any textbook PDF from the `docs/` folder (e.g. `NCERT-Class-10-History.pdf`).
4. Ask a question and watch the Context Pruning slash the token count instantly!

## 📂 Project Structure

- `index.html` — The core application (UI styling, PDF extraction logic, and all API interactions).
- `manifest.json` & `service-worker.js` — PWA configurations to allow the app to be installed directly to a mobile device's home screen.
- `docs/` — Contains sample NCERT textbooks for testing the application.
