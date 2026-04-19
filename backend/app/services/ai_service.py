from groq import Groq
from app.core.config import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_tasks_from_goal(goal: str):
    prompt = f"""
You are a task planning assistant.

Break the following goal into actionable tasks.

Rules:
- Return ONLY valid JSON
- Each task must have:
  - title
  - priority (LOW, MEDIUM, HIGH, URGENT)
  - estimated_minutes (integer)

Goal:
{goal}

Output format:
{{
  "tasks": [
    {{
      "title": "string",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "estimated_minutes": 60
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",  # ✅ fixed
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except Exception:
        raise ValueError(f"Invalid JSON from LLM:\n{content}")