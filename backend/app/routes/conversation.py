from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db

router = APIRouter(prefix="/conversations", tags=["conversations"])

# Placeholder for future routes
