from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: UUID
    reply: str


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)