from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from app.schemas.ai import AITaskList
from app.core.config import settings
from app.prompts.task_prompt import task_prompt

llm = ChatGroq(
    model=settings.GROQ_MODEL,
    temperature=0,
    groq_api_key=settings.GROQ_API_KEY,
)

structured_llm = llm.with_structured_output(AITaskList, strict=True)
prompt = task_prompt

chain = prompt | structured_llm

def generate_tasks_from_goal(goal: str):
    result = chain.invoke({"goal": goal})
    return result.tasks