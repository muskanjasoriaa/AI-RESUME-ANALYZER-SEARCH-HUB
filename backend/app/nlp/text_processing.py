import re
import math
from collections import Counter
from typing import List, Dict, Set, Tuple

# Comprehensive English stop words list
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", 
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", 
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", 
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", 
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", 
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", 
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", 
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", 
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", 
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", 
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", 
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", 
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", 
    "yourselves"
}

# High-impact resume action verbs categorized by domain
ACTION_VERBS: Set[str] = {
    # Leadership & Management
    "led", "spearheaded", "directed", "managed", "orchestrated", "supervised", "coordinated",
    "mentored", "governed", "championed", "advised", "guided", "empowered",
    # Development & Engineering
    "developed", "engineered", "built", "architected", "implemented", "designed", "created",
    "constructed", "coded", "programmed", "automated", "refactored", "debugged", "deployed",
    # Optimization & Performance
    "optimized", "accelerated", "enhanced", "streamlined", "boosted", "maximized", "reduced",
    "cut", "consolidated", "modernized", "scaled", "revitalized",
    # Research & Analysis
    "analyzed", "investigated", "evaluated", "formulated", "researched", "audited", "benchmarked",
    "identified", "diagnosed", "modeled", "tested", "validated",
    # Collaboration & Delivery
    "collaborated", "delivered", "partnered", "negotiated", "authored", "published", "presented",
    "launched", "executed", "integrated", "maintained", "pioneered"
}

def clean_text(text: str) -> str:
    """Normalize whitespace and strip unprintable characters."""
    if not text:
        return ""
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def tokenize(text: str, keep_special_chars: bool = True) -> List[str]:
    """
    Tokenizes text while preserving programming terms like C++, C#, .NET, Node.js.
    """
    if not text:
        return []
    
    # Preserve tokens like c++, c#, .net
    text_lower = text.lower()
    if keep_special_chars:
        # Match words, or terms with +, #, dot
        tokens = re.findall(r'[a-zA-Z0-9\+\#\.]+', text_lower)
        # Clean trailing periods unless it's .net or node.js
        cleaned = []
        for t in tokens:
            t = t.strip('.,;:')
            if t and len(t) > 1 or t in {'c', 'r'}:
                cleaned.append(t)
        return cleaned
    else:
        return re.findall(r'\b[a-zA-Z]{2,}\b', text_lower)

def extract_ngrams(tokens: List[str], n: int = 2) -> List[str]:
    """Generates n-grams from a list of tokens."""
    return [' '.join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def compute_tf(tokens: List[str]) -> Dict[str, float]:
    """Compute term frequencies normalized by document length."""
    counter = Counter(tokens)
    total = len(tokens)
    if total == 0:
        return {}
    return {k: v / total for k, v in counter.items()}

def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """
    Computes TF-IDF Cosine Similarity between two texts in pure Python.
    Handles unigrams and bigrams for strong semantic overlap detection.
    """
    tokens1 = [t for t in tokenize(text1) if t not in STOP_WORDS]
    tokens2 = [t for t in tokenize(text2) if t not in STOP_WORDS]
    
    if not tokens1 or not tokens2:
        return 0.0
        
    bigrams1 = extract_ngrams(tokens1, 2)
    bigrams2 = extract_ngrams(tokens2, 2)
    
    all_features1 = tokens1 + bigrams1
    all_features2 = tokens2 + bigrams2
    
    tf1 = compute_tf(all_features1)
    tf2 = compute_tf(all_features2)
    
    # Vocabulary
    vocab = set(tf1.keys()).union(set(tf2.keys()))
    
    # IDF heuristic with smooth weighting
    dot_product = 0.0
    norm1 = 0.0
    norm2 = 0.0
    
    for word in vocab:
        w1 = tf1.get(word, 0.0)
        w2 = tf2.get(word, 0.0)
        
        # Word length boost: multi-word technical skills get slight extra weight
        boost = 1.3 if " " in word else 1.0
        w1 *= boost
        w2 *= boost
        
        dot_product += w1 * w2
        norm1 += w1 * w1
        norm2 += w2 * w2
        
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    similarity = dot_product / (math.sqrt(norm1) * math.sqrt(norm2))
    return min(1.0, max(0.0, similarity))

def extract_action_verbs(text: str) -> List[str]:
    """Finds all high-impact action verbs used in resume text."""
    tokens = set(tokenize(text))
    found = [verb for verb in ACTION_VERBS if verb in tokens]
    return sorted(found)

def extract_quantifiable_metrics(text: str) -> List[Dict[str, str]]:
    """
    Detects metrics, percentages, throughput numbers, and financial impact.
    e.g. 'increased by 35%', '$100k', 'reduced latency from 500ms to 80ms', 'over 5,000 users'.
    """
    patterns = [
        r'\b\d+(?:\.\d+)?%',                                   # Percentages: 35%, 99.9%
        r'\$\s?\d+(?:,\d{3})*(?:\.\d+)?(?:\s?[kKmMbB])?',      # Money: $50k, $1.2M
        r'\b(?:reduced|increased|improved|boosted|saved|scaled)\s+(?:by\s+)?\d+(?:\.\d+)?%?',  # Action + number
        r'\b\d+(?:x|\s?fold)\b',                               # Multipliers: 10x, 3-fold
        r'\b\d+(?:,\d{3})+\b',                                 # Large counts: 50,000
        r'\b\d+(?:\.\d+)?\s*(?:ms|sec|seconds|gb|tb|req/sec|qps)\b' # Tech metrics
    ]
    
    metrics = []
    seen = set()
    for pat in patterns:
        matches = re.finditer(pat, text, re.IGNORECASE)
        for m in matches:
            val = m.group(0).strip()
            if val.lower() not in seen:
                seen.add(val.lower())
                # Grab surrounding context (up to 40 chars)
                start = max(0, m.start() - 25)
                end = min(len(text), m.end() + 25)
                context = text[start:end].replace('\n', ' ').strip()
                metrics.append({"metric": val, "context": f"...{context}..."})
                
    return metrics[:15]

def compute_readability_metrics(text: str) -> Dict[str, float]:
    """Calculates word count, sentence count, and average sentence length."""
    words = re.findall(r'\b[a-zA-Z0-9\+\#\.]+\b', text)
    sentences = re.split(r'[\.\!\?\n]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 3]
    
    word_count = len(words)
    sentence_count = max(1, len(sentences))
    avg_sentence_len = round(word_count / sentence_count, 1)
    
    # Estimated page count (standard 350-500 words per page)
    est_pages = max(1, round(word_count / 450, 1))
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_words_per_sentence": avg_sentence_len,
        "estimated_pages": est_pages
    }
