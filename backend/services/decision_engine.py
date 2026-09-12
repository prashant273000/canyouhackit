def decide(toxicity_scores, nsfw_scores, semantic_score):
    """
    Central decision engine unifying all models.
    Outputs: ALLOW, WARN, HIDE, PERSONAL_FILTER
    """
    # Personal filters
    if semantic_score >= 0.8:
        return "PERSONAL_FILTER", "semantic-trigger"
        
    # High risk (HIDE)
    if toxicity_scores.get("hate", 0) > 0.8 or nsfw_scores.get("graphic", 0) > 0.8:
        return "HIDE", "High risk content"
        
    # Moderate risk (WARN)
    if toxicity_scores.get("toxicity", 0) > 0.5 or nsfw_scores.get("nsfw", 0) > 0.5:
        return "WARN", "Moderate risk content"
        
    return "ALLOW", None
