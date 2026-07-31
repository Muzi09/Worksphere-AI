from google import genai
from google.genai import types

from app.core.config import settings
from app.core.prompts import (
    SYSTEM_INSTRUCTION,
    TITLE_GENERATION_PROMPT,
)


class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-2.5-flash"

    def generate(self, contents: list[dict]) -> str:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            ),
        )
        return response.text

    def generate_stream(self, contents: list[dict]):
        response = self.client.models.generate_content_stream(
            model=self.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            ),
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text

    async def generate_stream_async(self, contents: list[dict]):
        response = await self.client.aio.models.generate_content_stream(
            model=self.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            ),
        )

        async for chunk in response:
            if chunk.text:
                yield chunk.text

    def generate_title(self, message: str) -> str:
        prompt = TITLE_GENERATION_PROMPT.format(message=message)

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )

        return response.text.strip().replace('"', "")
        
    async def generate_title_async(self, message: str) -> str:
        prompt = TITLE_GENERATION_PROMPT.format(message=message)

        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )

        return response.text.strip().replace('"', "")