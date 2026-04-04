import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


model = SentenceTransformer("all-MiniLM-L3-v2")


SKILLS = [
    "python","sql","pandas","numpy","machine learning","statistics",
    "power bi","tableau","data analysis","deep learning","nlp",
    "excel","data visualization","scikit-learn"
]


ROLE_SKILLS = {
    "Data Scientist": ["python","machine learning","statistics","pandas","numpy"],
    "Data Analyst": ["sql","excel","power bi","data analysis","statistics"],
    "ML Engineer": ["python","machine learning","deep learning","numpy","scikit-learn"],
    "Business Analyst": ["excel","sql","data analysis","power bi"],
}


def extract_skills(text):
    text = text.lower()
    return [skill for skill in SKILLS if skill in text]


def extract_experience(text):
    matches = re.findall(r'(\d+)\+?\s*years?', text.lower())
    return max([int(x) for x in matches]) if matches else 0


def recommend_roles(candidate_skills):
    recommendations = []

    for role, skills in ROLE_SKILLS.items():
        overlap = len(set(candidate_skills) & set(skills))
        score = overlap / len(skills)

        if score > 0.3:
            recommendations.append({
                "role": role,
                "match": float(round(score * 100, 2))
            })

    return sorted(recommendations, key=lambda x: x["match"], reverse=True)


def build_summary(similarity, skills, experience):

    if experience >= 5:
        exp_text = "Extensive professional experience detected."
    elif experience >= 2:
        exp_text = "Moderate relevant work experience detected."
    elif experience > 0:
        exp_text = "Limited professional experience detected."
    else:
        exp_text = "No clear experience detected."

    if similarity > 0.6:
        reason = "Strong semantic alignment with job description."
    elif similarity > 0.4:
        reason = "Moderate alignment with job requirements."
    else:
        reason = "Low alignment with job description."

    return {
        "strengths": skills[:4],
        "experience_summary": exp_text,
        "match_reason": reason
    }


def rank_resumes(job_description, resumes):

    job_embedding = model.encode([job_description])
    resume_embeddings = model.encode(resumes)

    similarity_scores = cosine_similarity(job_embedding, resume_embeddings)[0]

    job_skills = extract_skills(job_description)

    results = []

    for i, resume in enumerate(resumes):

        # ✅ FIXED: convert numpy → python float
        similarity = float(similarity_scores[i])

        resume_skills = extract_skills(resume)

        skill_overlap = len(set(job_skills) & set(resume_skills))
        skill_score = skill_overlap / (len(job_skills) + 1)

        years = extract_experience(resume)
        exp_score = min(years / 5, 1)

        final_score = (
            0.5 * similarity +
            0.3 * skill_score +
            0.2 * exp_score
        )

        summary = build_summary(similarity, resume_skills, years)
        roles = recommend_roles(resume_skills)

        results.append({
            "candidate": f"Resume {i+1}",

            # ✅ ALL converted to float (IMPORTANT)
            "score": float(round(final_score * 100, 2)),
            "similarity": float(round(similarity * 100, 2)),
            "skill_match": float(round(skill_score * 100, 2)),

            "experience_years": int(years),
            "skills_found": resume_skills,
            "summary": summary,
            "recommended_roles": roles
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)