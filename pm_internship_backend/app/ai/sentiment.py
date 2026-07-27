"""
Sentiment Analysis Engine for Internship Feedback.
"""
try:
    from textblob import TextBlob
    _HAS_TEXTBLOB = True
except ImportError:
    _HAS_TEXTBLOB = False

def analyze_sentiment(text: str) -> str:
    """
    Analyzes the sentiment of a given text (e.g., student feedback).
    Returns "Positive", "Neutral", or "Negative".
    """
    if not text or not text.strip():
        return "Neutral"
        
    if not _HAS_TEXTBLOB:
        return "Neutral"
        
    # polarity ranges from -1.0 (very negative) to 1.0 (very positive)
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        return "Positive"
    elif polarity < -0.1:
        return "Negative"
    else:
        return "Neutral"
