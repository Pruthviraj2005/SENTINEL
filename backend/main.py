from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ranker import rank_resumes
import docx
import pdfplumber


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_resume(file):

    if file.filename.endswith(".txt"):
        return file.file.read().decode("utf-8")

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


@app.post("/rank-resumes")
async def rank_resume_api(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...)
):

    texts = [read_resume(file) for file in resumes]

    ranked = rank_resumes(job_description, texts)

    return {"ranking": ranked}