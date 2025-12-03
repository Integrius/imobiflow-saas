#!/bin/bash

echo "🔧 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔄 Generating Prisma Client..."
cd apps/api
npx prisma generate

echo "🏗️ Building TypeScript..."
pnpm run build

echo "✅ Build completed!"
