"""
Semantic Skill Matching Engine using NLP Vector Embeddings.
"""
from typing import List, Set
try:
    from sentence_transformers import SentenceTransformer, util
    _HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    _HAS_SENTENCE_TRANSFORMERS = False

# Load model lazily so it doesn't block app startup unless used
_model = None

def _get_model():
    global _model
    if _model is None and _HAS_SENTENCE_TRANSFORMERS:
        # 'all-MiniLM-L6-v2' is small, fast, and highly effective for semantic matching
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def match_skills_semantic(student_skills: Set[str], required_skills: Set[str], threshold: float = 0.6) -> Set[str]:
    """
    Given a set of student skills and required skills, finds semantic matches.
    Returns the required skills that the student has semantically matched.
    """
    if not student_skills or not required_skills:
        return set()
        
    model = _get_model()
    if not model:
        # Fallback to exact text overlap if sentence-transformers not installed
        return student_skills.intersection(required_skills)
        
    student_list = list(student_skills)
    required_list = list(required_skills)
    
    # Compute embeddings
    student_embeddings = model.encode(student_list, convert_to_tensor=True)
    required_embeddings = model.encode(required_list, convert_to_tensor=True)
    
    # Compute cosine similarities
    cosine_scores = util.cos_sim(student_embeddings, required_embeddings)
    
    matched_required = set()
    for i, s_skill in enumerate(student_list):
        for j, r_skill in enumerate(required_list):
            if cosine_scores[i][j] >= threshold:
                matched_required.add(r_skill)
                
    # Also include exact string intersections just in case
    exact_matches = student_skills.intersection(required_skills)
    return matched_required.union(exact_matches)
