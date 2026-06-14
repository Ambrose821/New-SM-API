from pydantic import BaseModel, Field, ConfigDict


class PostCaption(BaseModel):

    model_config = ConfigDict(extra="forbid")
    short_hook: str = Field(
        description="An engaging, straight fact, one sentence hook to drive engagement for the topic at hand"
    )

    bullet_points: list[str] = Field(
        min_length=3,
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
            Return exactly 2 terms for Openverse/Pixabay.
            k0 = specific subject (brand/org/person/place). For countries use "<country> logo" (not demonyms). Use exact proper names; full names for people; for cities use "<city> skyline" if apt, for brands "<brand name> logo" if apt.
            k1 = generic scene matching theme (pick a common, visually clear scene).
            Both terms: 1–2 words, nouns only, no punctuation, no duplicates.
            Examples:
            - political violence in Pakistan → ["Pakistan flag","protest"]
            - Air Canada passenger disputes → ["Air Canada","airport counter"]
            - Ukraine war update → ["Ukraine flag","soldier silhouette"]
            Return JSON per schema.
        '''
    )

class DiffusionImageBrief(BaseModel):
    model_config = ConfigDict(extra="forbid")

    editorial_scene: str = Field(
        description="""
        One vivid, concrete magazine-cover scene that visually tells the article's story.
        Must be imageable as a single scene.
        Use physical objects, locations, symbols, and visual action.
        Avoid generic keyword lists.
        Good: 'A cracked bank vault door spilling cash into a stormy Wall Street street while warning lights flash over a Federal Reserve building.'
        Bad: 'financial reports, executives, stock market, economy'.
        """
    )

    supporting_visuals: list[str] = Field(
        min_length=3,
        max_length=6,
        description="Concrete visual details to include in the scene, such as props, symbols, buildings, screens, charts, vehicles, flags, or documents."
    )

    style_direction: list[str] = Field(
        min_length=3,
        max_length=6,
        description="Style and composition only. Example: cinematic editorial illustration, dramatic lighting, high contrast, vertical 9:16, space for headline text."
    )


class PostContent(BaseModel):

    model_config = ConfigDict(extra="forbid")
    headline: str = Field(
        description="8–12 words. Conversational, no heavy rhetoric. Avoid colons unless necessary. No clichés. This should involve the most interesting info given the category of content. This MUST capture attention at first glance."
    )
    caption: PostCaption
    image_search_keywords: ImageSearchKeywords
    diffusion_prompts: DiffusionImageBrief
