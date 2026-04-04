from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ranker import rank_resumes
import docx
import pdfplumber

app = FastAPI()

# ✅ CORS (fine as it is)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ VERY IMPORTANT (Render health check)
@app.get("/")
def health():
    return {"status": "running"}

# ✅ Safe file reader (fixed file handling)
def read_resume(file: UploadFile):
    content = file.file.read()

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

    return ""

# ✅ MAIN API
@app.post("/rank-resumes")
async def rank_resume_api(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...)
):
    texts = [read_resume(file) for file in resumes]

    # ⚠️ IMPORTANT: rank_resumes should NOT load model globally
    ranked = rank_resumes(job_description, texts)

    return {"ranking": ranked}