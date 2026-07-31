from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest, ChatResponse, ConversationResponse, MessageResponse
from app.services.chat_service import ChatService
from app.services.gemini_service import GeminiService
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.database.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

def get_chat_service():
    gemini_service = GeminiService()
    conversation_repo = ConversationRepository()
    message_repo = MessageRepository()
    return ChatService(
        gemini_service=gemini_service,
        conversation_repo=conversation_repo,
        message_repo=message_repo
    )

@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return chat_service.chat(db, request, user.id)

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        chat_service.chat_stream(db, request, user.id),
        media_type="application/x-ndjson"
    )

@router.get("/conversations", response_model=list[ConversationResponse])
def get_conversations(
    chat_service: ChatService = Depends(get_chat_service),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Retrieve conversations ordered by created_at desc
    conversations = chat_service.get_conversations(db, user.id)
    # Sort them in-memory to ensure latest is first if repository doesn't
    conversations.sort(key=lambda x: x.created_at, reverse=True)
    return conversations

@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def get_messages(
    conversation_id: UUID,
    chat_service: ChatService = Depends(get_chat_service),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return chat_service.get_messages(db, conversation_id, user.id)
