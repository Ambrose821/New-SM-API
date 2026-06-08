from pydantic import BaseModel

class PostContentBase(BaseModel):
    """Base schema for post content."""
    pass


class PostContentRequest(PostContentBase):
    url: str = ""
    prompt: str = ""

class PostContentResponse(PostContentBase):
    headline: str
    caption: str
    keywords: list[str]
    diffusion_prompts: list[str]

