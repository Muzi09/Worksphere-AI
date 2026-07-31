from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat_router, conversation_router, file_router
from app.routes.auth import auth_router

app = FastAPI()

origins = [
    "http://localhost:3000",  # CRA
    "http://localhost:5173",  # Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(conversation_router)
app.include_router(auth_router)
app.include_router(file_router)

@app.get("/")
def home():
    return {"message": "Gemini Backend Running"}