from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.gemini_service import GeminiService
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.chat import ChatRequest, ChatResponse

class ChatService:
    def __init__(
        self, 
        gemini_service: GeminiService,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository
    ):
        self.gemini_service = gemini_service
        self.conversation_repo = conversation_repo
        self.message_repo = message_repo

    def chat(self, db: Session, request: ChatRequest, user_id) -> ChatResponse:
        conversation_id = request.conversation_id
        
        if conversation_id is None:
            # Generate a short title from the first message
            title = self.gemini_service.generate_title(request.message)
            conversation = self.conversation_repo.create(db, user_id=user_id, title=title)
            conversation_id = conversation.id
        else:
            if not self.conversation_repo.exists(db, conversation_id, user_id):
                raise HTTPException(status_code=404, detail="Conversation not found")
                
        self.message_repo.create(
            db=db,
            conversation_id=conversation_id,
            role="user",
            content=request.message
        )
        
        history = self.message_repo.list_by_conversation(db, conversation_id)
        
        contents = []
        for msg in history:
            contents.append({
                "role": msg.role,
                "parts": [{"text": msg.content}]
            })
            
        reply_text = self.gemini_service.generate(contents)
        
        self.message_repo.create(
            db=db,
            conversation_id=conversation_id,
            role="model",
            content=reply_text
        )
        
        return ChatResponse(
            conversation_id=conversation_id,
            reply=reply_text
        )

    async def chat_stream(self, db: Session, request: ChatRequest, user_id):
        import json
        from starlette.concurrency import run_in_threadpool
        conversation_id = request.conversation_id
        
        if conversation_id is None:
            # Generate a short title from the first message
            title = await self.gemini_service.generate_title_async(request.message)
            conversation = await run_in_threadpool(self.conversation_repo.create, db, user_id, title)
            conversation_id = conversation.id
        else:
            exists = await run_in_threadpool(self.conversation_repo.exists, db, conversation_id, user_id)
            if not exists:
                raise HTTPException(status_code=404, detail="Conversation not found")
                
        await run_in_threadpool(
            self.message_repo.create,
            db,
            conversation_id,
            "user",
            request.message
        )
        
        history = await run_in_threadpool(self.message_repo.list_by_conversation, db, conversation_id)
        
        contents = []
        for msg in history:
            contents.append({
                "role": msg.role,
                "parts": [{"text": msg.content}]
            })
            
        stream = self.gemini_service.generate_stream_async(contents)
        
        complete_reply = []
        async for chunk in stream:
            complete_reply.append(chunk)
            yield json.dumps({
                "conversation_id": str(conversation_id),
                "content": chunk
            }) + "\n"
            
        # Save the complete response after streaming
        await run_in_threadpool(
            self.message_repo.create,
            db,
            conversation_id,
            "model",
            "".join(complete_reply)
        )


    def get_conversations(self, db: Session, user_id):
        return self.conversation_repo.list(db, user_id=user_id)
        
    def get_messages(self, db: Session, conversation_id, user_id):
        if not self.conversation_repo.exists(db, conversation_id, user_id):
            raise HTTPException(status_code=404, detail="Conversation not found")
        return self.message_repo.list_by_conversation(db, conversation_id)
