import mongoose from 'mongoose';
import { SocialAccount } from '../../types';
import SocialAccountModel from '../socialAccount';

export function toSocialAccount(doc: any): SocialAccount {
  return {
    _id: doc._id ? String(doc._id) : null,
    platform: doc.platform,
    handle: doc.handle,
    instagramId: doc.instagramId ?? null,
  };
}

export function isValidSocialAccountId(socialAccountId: string) {
  return mongoose.Types.ObjectId.isValid(socialAccountId);
}

export async function getSocialAccounts(handle: string, platforms: string[]) {
  const filter = {
    platform: { $in: platforms },
    handle: { $regex: handle, $options: 'i' },
  };

  const socialAccounts = await SocialAccountModel.find(filter).select('-__v').lean();
  return socialAccounts.map(toSocialAccount);
}

export async function getSocialAccountById(socialAccountId: string) {
  const socialAccount = await SocialAccountModel.findById(socialAccountId)
    .select('_id platform instagramId handle')
    .lean();

  return socialAccount ? toSocialAccount(socialAccount) : null;
}

export async function socialAccountExists(socialAccountId: string) {
  const socialAccount = await SocialAccountModel.findById(socialAccountId).select('_id').lean();
  return Boolean(socialAccount);
}

export async function getSocialAccountByInstagramId(instagramId: string) {
  const socialAccount = await SocialAccountModel.findOne({ instagramId }).select('-__v').lean();
  return socialAccount ? toSocialAccount(socialAccount) : null;
}

export async function createInstagramSocialAccount(handle: string, instagramId: string) {
  const newAccount = new SocialAccountModel({
    platform: 'instagram',
    handle,
    instagramId,
  });

  await newAccount.save();
  return toSocialAccount(newAccount);
}
