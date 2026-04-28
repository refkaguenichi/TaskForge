from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.services.roadmap_service import RoadmapService
from app.services.task_service import TaskService
from app.services.ai_service import AiService
from app.core.enums import MessageRole


class ConversationOrchestrator:

    def __init__(self):
        self.conversation_service = ConversationService()
        self.message_service = MessageService()
        self.roadmap_service = RoadmapService()
        self.task_service = TaskService()
        self.ai_service = AiService()

    def handle(self, db, user, message, conversation_id):

        # 1. get or create conversation
        if not conversation_id:
            conversation = self.conversation_service.create_conversation(db, user.id, title=(message or "New conversation")[:50])
        else:
            conversation = self.conversation_service.get_conversation(db, conversation_id)

        # 2. save user message
        self.message_service.create_message(
            db=db,
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=message
        )

        # 3. build memory
        memory = self.message_service.get_messages(db, conversation.id)

        memory_text = "\n".join(
            [
                f"{m.role.value if hasattr(m.role, 'value') else str(m.role)}: {m.content}"
                for m in memory
            ]
        )

        # 4. AI call (planner)
        ai_result = self.ai_service.plan_tasks(
            goal=message,
            context=memory_text
        )

        # ✅ HARD FIX: normalize AI output
        if not isinstance(ai_result, dict):
            ai_result = {
                "assistant_message": "Tasks generated successfully.",
                "tasks": ai_result if isinstance(ai_result, list) else [],
                "roadmap": []
            }

        ai_result["assistant_message"] = ai_result.get(
            "assistant_message",
            "Tasks generated successfully."
        )
        ai_result["tasks"] = ai_result.get("tasks", [])
        ai_result["roadmap"] = ai_result.get("roadmap", [])

        # 5. roadmap
        roadmap = self.roadmap_service.create_roadmap(
            db=db,
            title=f"Roadmap for {message}",
            goal=message,
            user_id=user.id
        )

        # 6. assistant message
        assistant_msg = self.message_service.create_message(
            db=db,
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=ai_result["assistant_message"],
            roadmap_id=roadmap.id
        )

        # 7. tasks (keep your bulk logic)
        tasks = self.task_service.bulk_create(
            db=db,
            roadmap_id=roadmap.id,
            tasks=ai_result["tasks"]
        )

        return {
            "conversation_id": conversation.id,
            "message": assistant_msg,
            "roadmap": roadmap,
            "tasks": tasks
        }
