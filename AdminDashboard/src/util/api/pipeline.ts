import api from "./api";
import type { Pipeline, PipelineOptions, PipelineRequestData } from "@/types";


export const getPipelineOptions = async (): Promise<PipelineOptions> =>{
    const response = await api.get('/pipelines/options')
    const options = await response.data
    return options
}

export const createPipeline = async (pipelineData: PipelineRequestData): Promise<Pipeline> => {
    try{
        const response = await api.post('/pipelines',pipelineData)
        const pipeline = response.data.pipeline
        return pipeline
    }catch (error){
        //TODO Error handleing
        console.log((error as any).response ?? '')
        throw new Error("Error Creating Pipeline: " + error)
    }
}

/*
 TODO: This currently just assumes all pipelines are global. Add logic later for filtering
*/
export const getPipelines = async ():Promise<Pipeline[]> => {
    try {
        const response = await api.get('/pipelines')
        const pipelines = response.data.pipelines
        return pipelines
    } catch(error){

        console.error("Error fetching pipelines: " + error)
        throw new Error("Error Fetching Pipelines: " + error)
    }
}

export const runPipeline = async (
    pipelineId: string,
    quantity: number
): Promise<{ message: string; jobId: string | null }> => {
    try {
        const response = await api.post(`/pipelines/run/${pipelineId}`, { quantity })
        return response.data
    } catch(error){
        console.error("Error running pipeline: " + error)
        throw new Error("Error Running Pipeline: " + error)
    }
}
