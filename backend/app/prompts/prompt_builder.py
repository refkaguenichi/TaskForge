def build_prompt(goal: str, memory: str, context: str = ""):
    return f"""
You are an AI task planner.

User memory:
{memory}

Context:
{context}

Goal:
{goal}

Rules:
- tasks must be clear
- max 60 minutes each
- structured output
"""