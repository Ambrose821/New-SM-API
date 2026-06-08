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

    visual_subjects: list[str] = Field(
        description="Concrete visible subjects, objects, places, symbols, or brands that should appear in the image. Use short visual phrases only."
    )

    visual_metaphors: list[str] = Field(
        description="1 to 3 symbolic visual ideas that translate the article into an image. Example: 'gold coins flowing from streaming platforms into Canadian film production'."
    )

    style_direction: list[str] = Field(
        description="Visual style, mood, lighting, and composition. Example: 'cinematic editorial illustration', 'vertical 9:16 poster', 'dramatic lighting', 'space for headline text'."
    )

    negative_prompt: list[str] = Field(
        description="Things to avoid in the generated image, including unwanted styles, bad quality, artifacts, text errors, or irrelevant subjects."
    )

class PostContent(BaseModel):

    model_config = ConfigDict(extra="forbid")
    headline: str = Field(
        description="8–12 words. Conversational, no heavy rhetoric. Avoid colons unless necessary. No clichés. This should involve the most interesting info given the category of content. This MUST capture attention at first glance."
    )
    caption: PostCaption
    image_search_keywords: ImageSearchKeywords
    diffusion_prompts: DiffusionImageBrief
