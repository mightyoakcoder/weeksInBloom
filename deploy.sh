#!/bin/bash
# deploy.sh - Deploy Weeks in Bloom to Cloud Run
# Run: chmod +x deploy.sh && ./deploy.sh

set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-weeks-in-bloom}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="weeks-in-bloom"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
BUCKET="${GCS_BUCKET_NAME:-weeks-in-bloom-bucket}"

echo "🌱 Deploying Weeks in Bloom to Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"

# 1. Build & push Docker image
echo ""
echo "📦 Building and pushing Docker image..."
gcloud builds submit \
  --project "$PROJECT_ID" \
  --tag "$IMAGE" \
  .

# 2. Ensure Cloud Storage bucket exists
echo ""
echo "🪣 Ensuring Cloud Storage bucket exists..."
gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://$BUCKET" 2>/dev/null || echo "   Bucket already exists."
gsutil iam ch allUsers:objectViewer "gs://$BUCKET" 2>/dev/null || echo "   (Set bucket permissions manually if needed)"

# 3. Deploy to Cloud Run
echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GCS_BUCKET_NAME=${BUCKET},NODE_ENV=production" \
  --min-instances 0 \
  --max-instances 5 \
  --memory 512Mi \
  --cpu 1

echo ""
echo "✅ Deployed! Weeks in Bloom is live."
gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format "value(status.url)"
