import api from "./api";
import type { PipelineOptions } from "@/types";


export const getPipelineOptions = async (): Promise<PipelineOptions> =>{
    const response = await api.get('/pipelines/options')
    const options = await response.data
    return options
}

