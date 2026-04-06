import mongoose from 'mongoose';
import { Post } from '../../types';
import PostModel from '../post';

export interface PostQueryOptions {
  page: number;
  limit: number;
  search: string;
  sortBy: Record<string, 1 | -1 | 'asc' | 'desc'>;
  genre: string[];
  mediaType: string[];
}

export function toPost(doc: any): Post & { _id: string } {
  return {
    _id: String(doc._id),
    headline: doc.headline,
    description: doc.description ?? null,
    thumbnailUrl: doc.thumbnailUrl ?? null,
    videoUrl: doc.videoUrl ?? null,
    mediaType: doc.mediaType,
    genre: doc.genre,
    sourcedAt: doc.sourcedAt,
    imageAttributions: doc.imageAttributions ?? null,
    videoAttributions: doc.videoAttributions ?? null,
    audioAttributions: doc.audioAttributions ?? null,
    posted: doc.posted ?? false,
    pipelineId: doc.pipelineId ? String(doc.pipelineId) : null,
  };
}

export function isValidPostId(postId: string) {
  return mongoose.Types.ObjectId.isValid(postId);
}

export async function getPosts(options: PostQueryOptions) {
  const filter = {
    genre: { $in: options.genre },
    mediaType: { $in: options.mediaType },
    $or: [
      { headline: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } },
    ],
  };

  const [posts, numberOfPosts] = await Promise.all([
    PostModel.find(filter)
      .sort(options.sortBy)
      .skip(options.page * options.limit)
      .limit(options.limit)
      .select('-__v')
      .lean(),
    PostModel.countDocuments(filter),
  ]);

  return {
    posts: posts.map(toPost),
    numberOfPosts,
  };
}

export async function getPostsForPublishing(postIds: string[]) {
  return PostModel.find({ _id: { $in: postIds } }).select('_id posted').lean();
}
