from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class PostCaption(BaseModel):

    model_config = ConfigDict(extra="forbid")
    short_hook: str = Field(
        description="An engaging, straight fact, one sentence hook to drive engagement for the topic at hand"
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

    story_type: str = Field(
        description="A concise factual classification of what happened in the article, such as infrastructure expansion, product launch, corporate performance, regulation, security incident, partnership, or scientific development."
    )

    primary_subject: str = Field(
        description="The exact person, company, organization, product, place, or event that the article is principally about. Use the article's wording."
    )

    recognition_anchor: str = Field(
        description="The strongest article-supported non-human visual anchor: an exact company/brand and logo, product, building, landmark, vehicle, machine, flag, currency, or location. For a person-led story, use their most relevant associated organization, product, place, or symbol."
    )

    article_visual_evidence: list[str] = Field(
        min_length=1,
        max_length=5,
        description="One to five concrete visual facts explicitly supported by the article: named physical objects, products, machinery, buildings, locations, infrastructure, weather, materials, or observable actions. Do not add inferred props or generic technology imagery."
    )

    supported_action: str = Field(
        description="A physical action or state directly supported by the article and safe to depict. If none is stated, return 'No physical action stated' rather than inventing one."
    )

    central_consequence: str = Field(
        description="The article's main consequence or tension in one factual sentence. This informs mood but must not be converted into unsupported physical action."
    )

    concrete_scene_available: bool = Field(
        description="True when the article supplies enough real objects, places, infrastructure, products, or physical action for a concrete scene. If true, symbolic_metaphor must not be selected."
    )

    visual_strategy: Literal[
        "documentary_environment",
        "brand_environment",
        "product_showcase",
        "architecture_or_landmark",
        "industrial_process",
        "technology_detail",
        "transport_or_machinery",
        "geographic_or_national_imagery",
        "object_still_life",
        "financial_institution",
        "symbolic_metaphor",
    ] = Field(
        description="Choose exactly one strategy that most naturally represents the article evidence. Use symbolic_metaphor only when concrete_scene_available is false and no recognizable real-world scene is strong enough."
    )

    mood: Literal[
        "precise",
        "optimistic",
        "neutral",
        "institutional",
        "tense",
        "celebratory",
        "competitive",
        "cautious",
        "urgent",
        "subdued",
    ] = Field(
        description="Choose exactly one mood justified by the article's events and consequence, not merely by its category."
    )

    composition: Literal[
        "wide_environmental_shot",
        "close_up",
        "macro_detail",
        "overhead",
        "side_profile",
        "aerial",
        "asymmetric_foreground",
        "low_angle",
        "straight_architectural",
    ] = Field(
        description="Choose exactly one composition that best reveals the recognition anchor and article evidence. Do not default to centered low-angle architecture."
    )

    avoid_visual_cliches: list[str] = Field(
        min_length=2,
        max_length=5,
        description="Two to five tempting but article-unsupported visual shortcuts to exclude, such as lightning, storm clouds, floating logos, glowing skyscrapers, energy particles, or generic server rooms. Never exclude an element explicitly supported by the article."
    )

    editorial_scene: str = Field(
        description="""
        One coherent editorial scene built primarily from article_visual_evidence,
        recognition_anchor, and supported_action. Follow the selected visual_strategy,
        mood, and composition. Prefer the most realistic and recognizable representation
        of the story. Style may enhance the concrete scene but may not replace it. Never
        add people, body parts, invented entities, invented wordmarks, unsupported weather,
        or fabricated physical events. Use symbolism only when concrete_scene_available
        is false. The scene must be one image, not a collage or list.
        """
    )

    supporting_visuals: list[str] = Field(
        min_length=2,
        max_length=5,
        description="Two to five details drawn from article_visual_evidence or naturally required by the selected real environment. Strengthen recognition and factual understanding, not generic drama. No unsupported weather, energy effects, charts, UI, screenshots, headlines, or decorative filler."
    )

    style_direction: list[str] = Field(
        min_length=3,
        max_length=6,
        description="Three to six production directions that implement the selected mood and composition: editorial photography or restrained photoreal editorial art, article-appropriate lighting, camera/lens, depth, materials, color treatment, and vertical 9:16 framing. Styling must remain secondary to article evidence. Keep the main subject in the upper 60 percent for the post layout and request no rendered text."
    )


class PostContent(BaseModel):

    model_config = ConfigDict(extra="forbid")
    headline: str = Field(
        description="8–12 words. Conversational, no heavy rhetoric. Avoid colons unless necessary. No clichés. This should involve the most interesting info given the category of content. This MUST capture attention at first glance."
    )
    caption: PostCaption
    image_search_keywords: ImageSearchKeywords
    diffusion_prompts: DiffusionImageBrief
