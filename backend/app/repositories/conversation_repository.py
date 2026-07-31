from sqlalchemy.orm import Session
from app.models.conversation import Conversation
import uuid

class ConversationRepository:
    def create(self, db: Session, user_id: uuid.UUID, title: str | None = None) -> Conversation:
        db_conversation = Conversation(title=title, user_id=user_id)
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        return db_conversation

    def get(self, db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation | None:
        return db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user_id).first()

    def exists(self, db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        return db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user_id).first() is not None

    def list(self, db: Session, user_id: uuid.UUID) -> list[Conversation]:
        return db.query(Conversation).filter(Conversation.user_id == user_id).all()
