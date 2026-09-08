from core.LLMs.open_ai_llm import OpenAiLLM
from core.page_search import PageSearcher
from fastapi import APIRouter
from schemas.post_content import (
    PostContentRequest,
    PostContentResponse
)
from exception_handlers.exceptions import BadRequestError, UnexpectedError

from prompts.default_caption import IMAGE_BRIEF_PROMPT, SYSTEM_PROMPT

router = APIRouter(prefix="/post_content", tags=["post_content"])


@router.post("/generate_text_material", response_model=PostContentResponse, include_in_schema=False)
async def get_post_content(
    request: PostContentRequest,
):
    if(not request.url):
        raise BadRequestError("URL Must be present")
    llm = OpenAiLLM()
    searcher = PageSearcher(llm=llm)
    # A caller may customize the writing voice, but the image brief contract must
    # remain present so downstream image generation receives a useful, safe scene.
    system_prompt = (
        f"{request.prompt.strip()}\n\n{IMAGE_BRIEF_PROMPT}"
        if request.prompt.strip()
        else SYSTEM_PROMPT
    )
    out = await searcher.page_to_post_content(url=request.url,system_prompt=system_prompt)

    bullet_points_list = [f"👉 {point}" for point in out.caption.bullet_points]
    bullet_points = "\n" + "\n".join(bullet_points_list) + "\n"
    caption = "\n".join(
        [
            out.caption.short_hook,
            bullet_points,
            out.caption.question,
        ]
    )
    return {
        "headline": out.headline,
        "caption": caption,
        "keywords": [out.image_search_keywords.background_key_word],
        # Send only the composed scene so planning details do not become extra props.
        "diffusion_prompts": [out.diffusion_prompts.scene],
    }
