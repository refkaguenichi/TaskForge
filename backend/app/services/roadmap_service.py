from app.models.roadmap import Roadmap

class RoadmapService:

    def create_roadmap(self, db, goal, title, user_id):
        roadmap = Roadmap(
            goal=goal,
            title=title,
            user_id=user_id
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        return roadmap