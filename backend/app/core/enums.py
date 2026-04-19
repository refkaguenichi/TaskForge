import enum

class TaskStatus(str, enum.Enum):
    BACKLOG = "BACKLOG"
    TODO = "TODO"
    DOING = "DOING"
    DONE = "DONE"


class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"