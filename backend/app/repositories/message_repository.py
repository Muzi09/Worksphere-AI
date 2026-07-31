from sqlalchemy.orm import Session
from app.models.message import Message
import uuid

class MessageRepository:
    def create(self, db: Session, conversation_id: uuid.UUID, role: str, content: str) -> Message:
        db_message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message

    def list_by_conversation(self, db: Session, conversation_id: uuid.UUID) -> list[Message]:
        return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
