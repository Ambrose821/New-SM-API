import {Media,Genre, RenderRequest, RenderResponse, Post} from "../types";

import Sourcer from "../services/Sourcing/Sourcer";
import type { Pipeline, SourcerRequest } from "../types";

import { LLMAgent,GeminiLLMAgent } from '../services/LlmServices/LLMAgent'
import { LLMClient } from '../services/LlmServices/LLMClient'
import PixabayClient from "../services/ImageAndVideoSource/pixaBayClient";
import { ImageSourceRequest, ImageSourceStrategy } from "../services/ImageAndVideoSource/imageSourceStrategy";
import { MediaEditingClient } from "../services/MediaEditing/MediaEditingClient";
import { pipeLineSubscriber } from "./pipelineSubscribers/piplineSubscriber";
import { createSourceStrategy } from "../factories/SourceStrategyFacrory";
import { simpleMediaEditingAgent } from "../services/MediaEditing/MediaEditingAgent";
import { createImageSourceStrategy } from "../factories/ImageSourceFactory";
import { createLLMAgent } from "../factories/LlmAgentFactory";


/*
    This class acts as the controller for all functionality of the media processing pipeline and will perform all pipeline actions per media source.

    It is also the publisher or 'subject' for the pipelineSubscribers which get notified for each new post

*/
export default class PipelineRunner{

    private sourcer : Sourcer;
    private mediaEditingClient: MediaEditingClient;
    private llmCli: LLMClient;
    private primaryImageSourceStrategy: ImageSourceStrategy;
    private secondaryImageSourceStrategy: ImageSourceStrategy | null
    private pipeline : Pipeline
    private subscribers: pipeLineSubscriber[] =[];

    constructor(pipeline: Pipeline){
        this.pipeline = pipeline
        this.mediaEditingClient = new MediaEditingClient(new simpleMediaEditingAgent()) // Not expecting this to be modular soon

        const sourceStrategy = createSourceStrategy(pipeline.source)
        this.sourcer = new Sourcer(sourceStrategy)

        this.primaryImageSourceStrategy = createImageSourceStrategy(pipeline.backgroundImageSource.strategy)
        this.secondaryImageSourceStrategy = pipeline.foregroundImageSource ? createImageSourceStrategy(pipeline.foregroundImageSource.strategy) : null

        this.llmCli = new LLMClient(createLLMAgent(pipeline.llm.agent))
        
    }

    public addSubscriber(subscriber:pipeLineSubscriber){
        this.subscribers.push(subscriber)

    }
    public async notifySubscribers(post:Post){
        await Promise.all(
            this.subscribers.map((sub) => sub.handleReceivePost(post))
        )
    }

    public async runPipeline(){
        try{

        const sourceRequest: SourcerRequest = {
            pipeline: this.pipeline
        }

        const mediaObjArr :Media[]|null = await this.sourcer.source(sourceRequest);
        if(!mediaObjArr){
            throw new Error('Error in runPipeline: mediaObjArr is undefined')
        }
        
        await Promise.all(
            mediaObjArr.map(media => this.perMediaPipeline(media))
        )
       

        }catch(err){
            console.log("pipelineRunner Error: ", err);
            throw new Error("Error in pipelineRunner runPipeline(): " + err);
        }

    }

    public async perMediaPipeline(mediaObj: Media){

        try {

            const promptStr = mediaObj.headline + " " + mediaObj.textSnippet;

            const newsContent = await this.llmCli.generateNewsContent(promptStr)
            if(!newsContent){
                console.error("Skipping media item because AI content generation returned null", {
                    headline: mediaObj.headline,
                    genre: mediaObj.genre,
                });
                return;
            }

            const keywords = newsContent.keywords;
            
            if(!keywords){
                console.error("Skipping media item because AI Agent did not generate keywords", {
                    headline: mediaObj.headline,
                    genre: mediaObj.genre,
                });
                return;
            }

            const imageSourceRequest = {
                quantity: 1,
                keywords: keywords,
                text: newsContent.headline + " " + newsContent.summary
            } as ImageSourceRequest

            const imageSourceStrategies: {
                strategy: ImageSourceStrategy;
                request: ImageSourceRequest;
            }[] = [
                {
                    strategy: this.primaryImageSourceStrategy,
                    request: imageSourceRequest
                }
            ];

            if (this.secondaryImageSourceStrategy) {
                imageSourceStrategies.push({
                    strategy: this.secondaryImageSourceStrategy,
                    request: imageSourceRequest
                });
            }

            const fetchedImageGroups = await Promise.all(
                imageSourceStrategies.map(({ strategy, request }) => strategy.fetchImages(request))
            );
            const backgroundImage = fetchedImageGroups[0]?.[0] ?? null;
            const foregroundImage = fetchedImageGroups[1]?.[0] ?? null;

          
         
         const mediaEditingPayload = {
            bg_url: backgroundImage?.url ?? "" as String,
            fg_url: foregroundImage?.url ?? "" as String,
            caption: newsContent.headline,
            highlight: newsContent.highlightWords,
            category: this.pipeline.genre[0] ?? '',
            brand: "",
            width: 1080,
            height: 1920,
            duration: 20,
            fps: 30,
            audio_path:"audio.mp3",
            s3_bucket: "mediaapibucket",
            s3_key: `posts/${Date.now()}/post.mp4`,
            encoder: "libx264",
            preset: "medium"
        } as RenderRequest
        console.log(mediaEditingPayload)
        const renderResponse: RenderResponse = await this.mediaEditingClient.generateSimplePost(mediaEditingPayload)
        
        const imageAttributions = [backgroundImage, foregroundImage]
            .map((element) => element?.attribution)
            .filter((attribution): attribution is String => Boolean(attribution))

         const post:Post = {
            headline: newsContent.headline,
            description: newsContent.summary,
            thumbnailUrl: renderResponse.thumbnail ,
            videoUrl: renderResponse.video,
            mediaType: renderResponse.video ? 'Video' : 'Image',
            genre: mediaObj.genre,
            imageAttributions:imageAttributions.length ? imageAttributions :null,
            pipelineId: this.pipeline.id

         }as Post
         console.log(post)
         
         await this.notifySubscribers(post)
        } catch (error) {
            console.error("Error in pipelineRunner perMediaPipeline(). Skipping media item.", {
                headline: mediaObj.headline,
                genre: mediaObj.genre,
                error,
            });
            return;
        }


    }


}
