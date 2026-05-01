import { Pipeline } from '../../types';
import PipelineModel from '../pipeline';
import mongoose from 'mongoose';

export function toPipeline(doc: any): Pipeline {
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description ?? null,
    source: doc.source,
    source_url: doc.source_url,
    genre: doc.genre,
    frequency: doc.frequency,
    backgroundImageSource: doc.backgroundImageSource,
    foregroundImageSource: doc.foregroundImageSource ?? null,
    llm: doc.llm,
    socialAccountId: doc.socialAccountId ? String(doc.socialAccountId) : null,
    isActive: doc.isActive,
  };
}

export async function createPipeline(pipeline: Pipeline) {
  const newPipeline = new PipelineModel({
    name: pipeline.name,
    description: pipeline.description ?? null,
    source: pipeline.source,
    source_url: pipeline.source_url,
    genre: pipeline.genre,
    frequency: pipeline.frequency,
    backgroundImageSource: pipeline.backgroundImageSource,
    foregroundImageSource: pipeline.foregroundImageSource ?? null,
    llm: pipeline.llm,
    socialAccountId: pipeline.socialAccountId ?? null,
    isActive: pipeline.isActive ?? true,
  });

  await newPipeline.save();
  return newPipeline;
}

export async function updatePipeline(pipelineId: string, pipeline: Partial<Pipeline>) {
  return PipelineModel.findByIdAndUpdate(
    pipelineId,
    {
      $set: {
        ...pipeline,
      },
    },
    { new: true, runValidators: true }
  );
}

export function isValidPipelineId(pipelineId: string) {
  return mongoose.Types.ObjectId.isValid(pipelineId);
}

export function isValidSocialAccountId(socialAccountId: string) {
  return mongoose.Types.ObjectId.isValid(socialAccountId);
}

export async function getPipelines() {
  const pipelines = await PipelineModel.find().select('-__v').sort({ createdAt: -1 }).lean();
  return pipelines.map(toPipeline);
}

export async function getPipelineById(pipelineId: string) {
  const pipeline = await PipelineModel.findById(pipelineId).select('-__v').lean();
  return pipeline ? toPipeline(pipeline) : null;
}

export async function deletePipeline(pipelineId: string) {
  return PipelineModel.findByIdAndDelete(pipelineId).select('_id').lean();
}
