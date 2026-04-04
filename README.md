SENTINEL – AI Resume Intelligence Engine

SENTINEL is an AI-powered resume ranking system that analyzes and ranks candidates based on their relevance to a given job description using Natural Language Processing (NLP).

🚀 Features

- Upload multiple resumes (PDF/DOCX)
- Paste job description
- AI-based semantic matching
- Candidate ranking with scores
- Modern glassmorphic UI

🧠 Tech Stack

- Frontend: Next.js
- Backend: FastAPI
- AI Model: Sentence Transformers (MiniLM)
- Styling: CSS (Glassmorphism UI)

⚙️ How It Works

1. Extracts text from resumes
2. Converts text into embeddings
3. Compares with job description
4. Calculates similarity scores
5. Ranks candidates accordingly

📦 Run Locally

Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Frontend

cd frontend
npm install
npm run dev

📌 Future Enhancements

- Explainable AI scoring
- Resume feedback suggestions
- Recruiter dashboard
- Cloud deployment

---

© 2026 SENTINEL – AI Resume Intelligence Engine
