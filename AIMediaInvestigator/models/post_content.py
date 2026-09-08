from pydantic import BaseModel, Field, ConfigDict


class PostCaption(BaseModel):

    model_config = ConfigDict(extra="forbid")
    short_hook: str = Field(
        description="One conversational, factual sentence, preferably under 15 words. Continue the headline with a concrete story detail that draws readers into the bullets. Build interest without repeating the headline or adding an empty teaser."
    )

    bullet_points: list[str] = Field(
        min_length=5,
        max_length=5,
        description= '''
        - Each bullet should be ONE sentence.
        - Prefer under 20 words per bullet.
        - Focus on:
        - numbers
        - timelines
        - surprising details
        - comparisons
        - implications
        - unusual facts

        - Bullets should feel punchy and readable.
        - Do NOT repeat information.
        - Do NOT sound overly formal.
        - Develop the story and deliver the headline's promised explanation using only article-supported facts.

        Use this format:

        • Bullet
        • Bullet
        • Bullet
        '''
    )

    question: str = Field(
        description="A final question about the subject to inspire thought provoking ideas"
    )

class ImageSearchKeywords(BaseModel):

    model_config = ConfigDict(extra="forbid")
    background_key_word: str = Field(
        description='''
            One fallback image-search query naming the article's most recognizable
            visual subject. Use an exact proper name where available, such as
            "NVIDIA logo", "Apple Park", "White House", or "Toronto skyline".
            Return a plain 1–3 word string, not a list and not a sentence.
        '''
    )

class DiffusionImageBrief(BaseModel):
    model_config = ConfigDict(extra="forbid")

    focal_elements: list[str] = Field(
        min_length=1,
        max_length=2,
        description="One or two concrete, article-supported non-human subjects that capture the story's most interesting visual idea. Use exact identities where relevant. One element is enough; add a second only if their relationship creates a stronger hook. These are the only meaningful subjects in the image."
    )

    visual_hook: str = Field(
        description="One short sentence describing what makes the selected elements arresting at a glance: an unexpected pairing, revealing detail, bold crop, unusual perspective, or partial reveal. Create curiosity about the real story without explaining it all or inventing a mystery. Subtle theatrical lighting or staging is welcome; fabricated events and misleading scientific details are not."
    )

    scene: str = Field(
        description="Write the final image prompt in roughly 40–70 words. Combine only the focal_elements and visual_hook into one striking scene with a simple background and a clear focal point. Include the chosen framing and lighting here; this field alone goes to the image generator. Leave the explanation to the caption. Use accurate subjects and materials; add no contextual props, people, body parts, invented events, data, or text overlays. Authentic relevant logos are allowed. Frame vertically in 9:16 with the focal elements in the upper 60 percent and a quiet lower area for the post headline."
    )


class PostContent(BaseModel):

    model_config = ConfigDict(extra="forbid")
    headline: str = Field(
        description="""
        Write one 8–12 word Instagram cover headline that stops the scroll.
        Find the story's strongest tension and choose the angle that fits:
        - Curiosity: a specific result with the reason or twist left open.
        - Transformation: a striking before/after that makes readers wonder what changed.
        - Bold statement: a supported claim that challenges a familiar expectation.

        Make the subject recognizable and the stakes tangible. Reveal enough to make
        the missing piece interesting; save its explanation for the caption.
        Use vivid, conversational wording. Favor a compelling statement over a generic
        why/how title when it fits. Let the facts create the intrigue.
        Stay faithful to the article and preserve essential qualifiers. Never invent
        personal experience, secrets, or drama. Avoid cliches and "read more".
        The caption must fulfill the headline's promise. Return only the headline.
        """
    )
    caption: PostCaption
    image_search_keywords: ImageSearchKeywords
    diffusion_prompts: DiffusionImageBrief
