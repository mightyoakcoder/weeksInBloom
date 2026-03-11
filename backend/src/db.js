import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
  // When running on Cloud Run, uses Application Default Credentials automatically.
  // Locally, set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key path.
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  databaseId: 'weeks-in-bloom-db',
});

export default db;
