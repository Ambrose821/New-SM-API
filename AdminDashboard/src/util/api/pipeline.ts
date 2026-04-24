import api from "./api";
import type { Pipeline, PipelineOptions } from "@/types";


export const getPipelineOptions = async (): Promise<PipelineOptions> =>{
    const response = await api.get('/pipelines/options')
    const options = await response.data
    return options
}

export const createPipeline = async (pipelineData:Pipeline) => {
    try{
        const response = await api.post('/pipelines',pipelineData)
        const pipeline = response.data.pipeline
        return pipeline
    }catch (error){
        //TODO Error handleing
        console.log((error as any).response ?? '')
        throw error
    }
}