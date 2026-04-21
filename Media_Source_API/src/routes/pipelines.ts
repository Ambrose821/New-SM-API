import express from 'express'
import {
    createPipeline,
    deletePipeline,
    getPipelineById,
    getPipelines,
    isValidPipelineId,
    toPipeline,
    updatePipeline
} from '../models/mappers/pipelineMapper'
import { isValidSocialAccountId, socialAccountExists } from '../models/mappers/socialAccountMapper'
import { ImageSourceType, LLMAgentType, Pipeline as PipelineType, PipelineFrequency, SourceType } from '../types'

const router = express.Router()

const SOURCE_OPTIONS: SourceType[] = ['rssApp', 'newsIO', '9gag']
const IMAGE_SOURCE_OPTIONS: ImageSourceType[] = ['openverse', 'pixabay', 'falAI']
const LLM_AGENT_OPTIONS: LLMAgentType[] = ['gemini-2.5-flash']
const FREQUENCY_OPTIONS: PipelineFrequency[] = ['daily', 'weekly', 'monthly']

router.get('/', async (req, res) => {
    try{
        const pipelines = await getPipelines()
        res.status(200).json({ pipelines })
    }catch(error){
        res.status(500).json({ message: 'Error fetching pipelines', error })
    }
})

router.get('/options', (req, res) => {
    try{
        res.status(200).json({
            sources: SOURCE_OPTIONS,
            imageSources: IMAGE_SOURCE_OPTIONS,
            llmAgents: LLM_AGENT_OPTIONS,
            frequencies: FREQUENCY_OPTIONS,
        })
    }catch(error){
        res.status(500).json({ message: 'Error fetching pipeline options', error })
    }
})

router.get('/:id', async (req, res) => {
    try{
        const { id } = req.params
        if(!isValidPipelineId(id)){
            return res.status(400).json({ message: 'Invalid pipeline id' })
        }

        const pipeline = await getPipelineById(id)
        if(!pipeline){
            return res.status(404).json({ message: 'Pipeline not found' })
        }

        res.status(200).json({ pipeline })
    }catch(error){
        res.status(500).json({ message: 'Error fetching pipeline', error })
    }
})

router.post('/', async (req, res) => {
    try{
        const pipeline = req.body as PipelineType

        if (pipeline.socialAccountId && !isValidSocialAccountId(String(pipeline.socialAccountId))) {
            return res.status(400).json({ message: 'Invalid socialAccountId' })
        }

        if (pipeline.socialAccountId) {
            const exists = await socialAccountExists(String(pipeline.socialAccountId))
            if (!exists) {
                return res.status(404).json({ message: 'Social account not found' })
            }
        }

        const createdPipeline = await createPipeline(pipeline)
        res.status(201).json({ pipeline: toPipeline(createdPipeline) })
    }catch(error){
        res.status(500).json({ message: 'Error creating pipeline', error })
    }
})

router.patch('/:id', async (req, res) => {
    try{
        const { id } = req.params
        const pipelineUpdate = req.body as Partial<PipelineType>

        if(!isValidPipelineId(id)){
            return res.status(400).json({ message: 'Invalid pipeline id' })
        }

        if (
            pipelineUpdate.socialAccountId !== undefined &&
            pipelineUpdate.socialAccountId !== null &&
            !isValidSocialAccountId(String(pipelineUpdate.socialAccountId))
        ) {
            return res.status(400).json({ message: 'Invalid socialAccountId' })
        }

        if (pipelineUpdate.socialAccountId) {
            const exists = await socialAccountExists(String(pipelineUpdate.socialAccountId))
            if (!exists) {
                return res.status(404).json({ message: 'Social account not found' })
            }
        }

        const updatedPipeline = await updatePipeline(id, pipelineUpdate)
        if(!updatedPipeline){
            return res.status(404).json({ message: 'Pipeline not found' })
        }

        res.status(200).json({ pipeline: toPipeline(updatedPipeline) })
    }catch(error){
        res.status(500).json({ message: 'Error updating pipeline', error })
    }
})

router.delete('/:id', async (req, res) => {
    try{
        const { id } = req.params
        if(!isValidPipelineId(id)){
            return res.status(400).json({ message: 'Invalid pipeline id' })
        }

        const deletedPipeline = await deletePipeline(id)
        if(!deletedPipeline){
            return res.status(404).json({ message: 'Pipeline not found' })
        }

        res.status(200).json({ message: 'Pipeline deleted', pipelineId: id })
    }catch(error){
        res.status(500).json({ message: 'Error deleting pipeline', error })
    }
})

export default router
