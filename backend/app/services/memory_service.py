from app.core.redis import redis_client
import json

class MemoryService:

    def save_message(self, conversation_id, role, content):
        key = f"conv:{conversation_id}:memory"

        redis_client.rpush(key, json.dumps({
            "role": role,
            "content": content
        }))

        redis_client.expire(key, 300)  # 🔥 5 minutes

    def get_memory(self, conversation_id):
        key = f"conv:{conversation_id}:memory"
        data = redis_client.lrange(key, 0, -1)

        return [json.loads(x) for x in data]