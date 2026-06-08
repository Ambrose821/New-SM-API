
from abc import ABC, abstractmethod
from models.post_content import PostContent
class LLM(ABC):
    @abstractmethod
    def simple_prompt(self, system_prompt: str, input_prompt:str) -> str:
        pass
    
    @abstractmethod
    def post_content_prompt(self,system_prompt, input_prompt:str) -> PostContent:
        pass