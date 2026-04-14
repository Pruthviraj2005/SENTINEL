from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ranker import rank_resumes

import docx
import pdfplumber
import os

app = FastAPI()

# ✅ CORS (VERY IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ HEALTH CHECK (Render needs this)
@app.get("/")
def health():
    return {"status": "running"}


# ✅ SAFE FILE READER (FIXED)
def read_resume(file: UploadFile):
    content = file.file.read()

    try:
        if file.filename.endswith(".txt"):
            return content.decode("utf-8", errors="ignore")

        if file.filename.endswith(".docx"):
            doc = docx.Document(file.file)
            return " ".join([p.text for p in doc.paragraphs])

        if file.filename.endswith(".pdf"):
            text = ""
            with pdfplumber.open(file.file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text

    except Exception as e:
        return ""

    return ""


# ✅ MAIN API
@app.post("/rank-resumes")
async def rank_resume_api(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...)
):
    try:
        texts = [read_resume(file) for file in resumes]

        ranked = rank_resumes(job_description, texts)

        return {"ranking": ranked}

    except Exception as e:
        return {"error": str(e)}


# ✅ REQUIRED FOR RENDER (PORT FIX)
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)