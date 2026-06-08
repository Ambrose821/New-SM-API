from core.LLMs.llm import LLM
from openai import OpenAI, APIError, RateLimitError, APITimeoutError
from typing import Any
from models.post_content import PostContent
from exception_handlers.exceptions import LlmContentError, LlmRateLimitError

ACCEPTED_MODELS = [
'gpt-4.1-mini'
]

class OpenAiLLM(LLM):
    model: str

    def __init__(self, model:str=ACCEPTED_MODELS[0]):
        if model not in ACCEPTED_MODELS:
            raise ValueError(f'{model} is not a valid OpenAI model')
        self.model = model
        self.client = OpenAI()

    def simple_prompt(self, system_prompt: str, input_prompt:str) -> str:
        input_list: list[Any] = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role":"user",
                "content": input_prompt
            }
        ]

        if not self.model or self.model not in ACCEPTED_MODELS:
            raise LlmContentError(f'{self.model} is not a valid OpenAI model')
        
        try:
            response = self.client.responses.create(model=self.model, input=input_list)

            for output in response.output:
                if output.type != "message":
                    raise LlmContentError("Unexpected non message")

                for item in output.content:
                    if item.type == "refusal":
                        # If the model refuses to respond, you will get a refusal message
                        LlmContentError(f"LLM refused content generation")
                        continue

                    if not item.parsed:
                        raise LlmContentError("Could not parse response")
                    
        except RateLimitError as e:
            raise LlmRateLimitError(f"OpenAI Rate limit Error {e}")
        
        except APITimeoutError as e:
            raise LlmContentError("OpenAI request timed out.") from e

        except APIError as e:
            raise LlmContentError(f"OpenAI API error: {e}") from e

            
            return response
    
    def post_content_prompt(self, system_prompt: str, input_prompt: str) -> PostContent:
        input_list: list[Any] = [
            {
                "role" : "system",
                "content" : system_prompt
            },
            {
               "role" : "user",
               "content": input_prompt
            }
        ]

        if not self.model or self.model not in ACCEPTED_MODELS:
            raise (f'{self.model} is not a valid OpenAI model')
        try:
            response = self.client.responses.parse(
                model=self.model,
                input=input_list,
                text_format=PostContent
            )

            if response.output_parsed is None:
                raise LlmContentError("OpenAI response did not contain parsed PostContent")
            

            for output in response.output:
                if output.type != "message":
                    raise LlmContentError("Unexpected non message")

                for item in output.content:
                    if item.type == "refusal":
                        # If the model refuses to respond, you will get a refusal message
                        LlmContentError(f"LLM refused content generation")
                        continue

                    if not item.parsed:
                        raise LlmContentError("Could not parse response")
                    
            return response.output_parsed
        except RateLimitError as e:
            raise LlmRateLimitError(f"OpenAI Rate limit Error {e}")
        
        except APITimeoutError as e:
            raise LlmContentError("OpenAI request timed out.") from e

        except APIError as e:
            raise LlmContentError(f"OpenAI API error: {e}") from e
