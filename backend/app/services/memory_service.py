
from app.models.user_memory import UserMemory
from uuid import uuid4

def get_memory(db, user_id: str):
    rows = db.query(UserMemory).filter_by(user_id=user_id).all()

    return "\n".join([
        f"{m.key}: {m.value}" for m in rows
    ])


def save_memory(db, user_id: str, key: str, value: str):
    memory = UserMemory(
        id=str(uuid4()),
        user_id=user_id,
        key=key,
        value=value
    )
    db.add(memory)
    db.commit()