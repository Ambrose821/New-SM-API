
class UnexpectedError(Exception):
     """Raised when an unexpected or unhandled server-side error occurs."""
     pass

class LlmRateLimitError(Exception):
    """Raised when an llm is rate limiting a requestor"""
    pass

class BadRequestError(Exception):
     """ Raise for bad requests."""

class LlmContentError(Exception):
     """ Raises for issues with LLM Content generation """
     pass