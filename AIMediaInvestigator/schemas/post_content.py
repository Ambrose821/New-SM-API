from pydantic import BaseModel

class PostContentBase(BaseModel):
    """Base schema for post content."""
    pass


class PostContentRequest(PostContentBase):
    url: str = ""
    # Optional caption-writing override. Core image-brief rules are always appended.
    prompt: str = ""

class PostContentResponse(PostContentBase):
    headline: str
    caption: str
    keywords: list[str]
    diffusion_prompts: list[str]  # Ordered scene, supporting details, and direction.
