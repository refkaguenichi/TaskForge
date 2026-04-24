def build_prompt(goal: str, context: str = ""):
    return f"""
You are an AI task planner.

Context:
{context}

Goal:
{goal}

Rules:
- tasks must be clear
- max 60 minutes each
- structured output
"""