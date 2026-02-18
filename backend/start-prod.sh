#!/bin/bash
set -e

echo "Starting production server..."
echo "DATABASE_URL length: ${#DATABASE_URL}"
echo "GOOGLE_CLIENT_ID length in shell: ${#GOOGLE_CLIENT_ID}"

# Write all Railway env vars to .env so dotenv can load them
cat > .env << EOF
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
NODE_ENV=${NODE_ENV}
PORT=${PORT}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}
KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}
KAKAO_CLIENT_SECRET=${KAKAO_CLIENT_SECRET}
KAKAO_REDIRECT_URI=${KAKAO_REDIRECT_URI}
NAVER_CLIENT_ID=${NAVER_CLIENT_ID}
NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}
NAVER_REDIRECT_URI=${NAVER_REDIRECT_URI}
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF

echo "Written env vars to .env file"

# Download Korean font for PDF warranty generation
mkdir -p src/fonts
if [ ! -f src/fonts/NanumGothic.ttf ]; then
  echo "Downloading Korean font..."
  wget -q --timeout=15 -O src/fonts/NanumGothic.ttf "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf" || echo "Font download failed, PDF will use fallback font"
  echo "Font ready"
fi

# Run Prisma migrations
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

# Run seed (upsert 방식이므로 중복 실행 안전)
echo "Running seed..."
DATABASE_URL="$DATABASE_URL" node prisma/seed.js
echo "Seed complete"

# Start the server
node src/index.js
