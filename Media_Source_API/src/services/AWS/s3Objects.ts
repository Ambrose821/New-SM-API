import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    } : undefined,
});

export async function deleteS3Objects(bucket: string, keys: string[]) {
    const uniqueKeys = [...new Set(keys.filter(Boolean))];

    if (uniqueKeys.length === 0) {
        return { deleted: [], errors: [] };
    }

    const response = await s3.send(new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
            Objects: uniqueKeys.map((Key) => ({ Key })),
            Quiet: false,
        },
    }));

    return {
        deleted: response.Deleted ?? [],
        errors: response.Errors ?? [],
    };
}
