from pydantic import BaseModel
from datetime import datetime
import uuid

class CreateConversationRequest(BaseModel):
    title: str | None = None

class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
