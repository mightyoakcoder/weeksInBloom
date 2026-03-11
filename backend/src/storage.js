import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'weeks-in-bloom-bucket';

export const bucket = storage.bucket(BUCKET_NAME);
export default storage;
