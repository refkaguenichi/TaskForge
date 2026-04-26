from langchain_groq import ChatGroq
from app.schemas.ai import AITaskList
from app.core.config import settings
from app.prompts.task_prompt import task_prompt

llm = ChatGroq(
    model=settings.GROQ_MODEL,
    temperature=0.2,
    groq_api_key=settings.GROQ_API_KEY,
    # max_tokens=1500
)

structured_llm = llm.with_structured_output(AITaskList)

chain = task_prompt | structured_llm


class AiService:
    def __init__(self):
        self.chain = chain

    def generate_tasks_from_goal(self, goal: str, context: str = "", retries=2):
        for _ in range(retries):
            try:
                result = self.chain.invoke({
                    "goal": goal,
                    "context": context,
                })

                if result and getattr(result, "tasks", None):
                    return result.tasks

            except Exception as e:
                print("AI error:", e)

        return []  # safe fallback

    def generate_tasks_from_file(self, file_text: str, retries=2):
        for _ in range(retries):
            try:
                result = self.chain.invoke({
                    "goal": file_text
                })

                if result and getattr(result, "tasks", None):
                    return result.tasks

            except Exception as e:
                print("AI error:", e)

        return []

    def plan_tasks(self, goal: str, context: str = ""):
        try:
            result = self.chain.invoke({
                "goal": goal,
                "context": context,
            })

        except Exception as e:
            print("AI crash fallback:", e)
            return {
                "assistant_message": "I couldn't generate structured tasks, but I will retry later.",
                "tasks": [],
                "roadmap": []
            }

        # normalize safely
        return {
            "assistant_message": getattr(result, "assistant_message", "Here are your tasks."),
            "tasks": getattr(result, "tasks", []) or [],
            "roadmap": getattr(result, "roadmap", []) or []
        }