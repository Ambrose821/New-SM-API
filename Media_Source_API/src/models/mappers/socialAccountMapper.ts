import mongoose from 'mongoose';
import { InstagramAuthData, SocialAccount } from '../../types';
import { encryptValue } from '../../security/encryption';
import SocialAccountModel from '../socialAccount';

export function toSocialAccount(doc: any): SocialAccount {

  return {
    _id: doc._id ? String(doc._id) : null,
    platform: doc.platform,
    handle: doc.handle,
    instagramId: doc.instagramId ?? null,
    instagramToken: doc.instagramToken, //intentionally left encrypted. callers can decrypt
    authExpiresAt: doc.authExpiresAt
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

export async function createInstagramSocialAccount(data: InstagramAuthData) {
  const encrypted_token = encryptValue(data.long_access_token).cipherText
  const newAccount = new SocialAccountModel({
    platform: 'instagram',
    handle: data.user_name,
    instagramId: data.instagram_id,
    instagramToken: encrypted_token,
    authExpiresAt: data.expirey_date
  });

  await newAccount.save();
  return toSocialAccount(newAccount);
}
