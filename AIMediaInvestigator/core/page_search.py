
import requests
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.models import CrawlResult
from fastapi.concurrency import run_in_threadpool
from core.LLMs.llm import LLM
from models.post_content import PostContent
from exception_handlers.exceptions import BadRequestError,UnexpectedError


from typing import Any

class PageSearcher:
    target_url: str

    
    def __init__(self,llm: LLM | None = None):
        self.llm = llm

        # Clear noise, minimize tokens
        self.config = CrawlerRunConfig(
            excluded_tags=["nav", "footer","aside", "form"],
            exclude_external_links= True,
            exclude_internal_links=True,
            exclude_social_media_links=True,
            markdown_generator=self._get_mark_down_generator()
        )
    

    async def page_to_post_content(self, url:str, system_prompt: str) -> PostContent:
        self.target_url = url
        page_markdown = await self._get_page_markdown(url=url)

        if not page_markdown:
            raise BadRequestError(f"Error getting pagemarkdown. Verify url is vaid: {url}")
        
        result: PostContent = await run_in_threadpool(
            self.llm.post_content_prompt,
            system_prompt=system_prompt,
            input_prompt=page_markdown,
        )
        return result
        
            

    async def page_info_prompt(self, url: str, system_prompt: str) -> str:
        self.target_url = url
        
        page_markdown = await self._get_page_markdown(url=url)

        if not page_markdown:
            raise ValueError(f"Error getting page markdown, Verify url is valid: {url}")
        try:
            result = await run_in_threadpool(
                self.llm.simple_prompt,
                system_prompt=system_prompt,
                input_prompt=page_markdown,
            )
        except BaseException as e:
            raise Exception(f"LLM Error in PageSearcher: {e}")
        return result.output_text
        
    async def _get_page_markdown(self,url: str) -> str | None:
        raw_html = await run_in_threadpool(self._get_raw_html, url)
        raw_html_content = f"raw:{raw_html}"

        async with AsyncWebCrawler() as crawler:
            
            result: CrawlResult = await crawler.arun(raw_html_content, config=self.config)
            
            if result.success:
                return result.markdown.fit_markdown
            return None
        
    ''' 
    Relying on crawl4ai to fetch html pages and parse is unrelyable because it uses a browser
    That means that our html of interest can get blocked by cookie banners.

    Fetching raw html text using an http request bypasses browser based content like popup cookie banners
    '''
    def _get_raw_html(self, url: str) -> str:
        try:
            response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
            text = response.text 
            return text
        except requests.exceptions.MissingSchema as e:
            raise BadRequestError(f"Error with url: {url}")
        except Exception as e:
            raise UnexpectedError(e)
    

    def _get_pruning_filter(self, threshold: float = 0.5, threshold_type: str = "dynamic", min_word_threshold: int = 10):

        if threshold_type not in ["dynamic","fixed"]:
            raise ValueError(f"Error in _get_pruning_filter: threshold_type must be \"fixed\" or \"dynamic\". Got: {threshold_type}")
        
        prune_filter = PruningContentFilter(
            threshold=threshold,
            threshold_type=threshold,
            min_word_threshold=min_word_threshold
        )

        return prune_filter
    
    def _get_mark_down_generator(self, threshold: float = 0.5, threshold_type: str = "dynamic", min_word_threshold: int = 10):

        pruning_filter = self._get_pruning_filter(threshold, threshold_type, min_word_threshold)
        md_generator = DefaultMarkdownGenerator(content_filter=pruning_filter)
        return md_generator



        
