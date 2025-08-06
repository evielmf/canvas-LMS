#!/bin/bash

# Run Database Migration for Sync Conflicts
# This ensures the sync_conflicts table and related components are properly set up

MIGRATION_URL="http://localhost:3000/api/migrate"
AUTH_HEADER="Bearer migrate-db-2024"

echo "🔄 Running database migration for Sync Conflicts..."

response=$(curl -s -X POST "$MIGRATION_URL" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json")

if echo "$response" | grep -q '"success":true'; then
    echo "✅ Migration completed successfully!"
    echo "The sync_conflicts table and related components have been set up."
else
    echo "❌ Migration failed!"
    echo "Response: $response"
    echo ""
    echo "Please ensure:"
    echo "  1. The development server is running (npm run dev)"
    echo "  2. Supabase is properly configured"
    echo "  3. The SUPABASE_SERVICE_ROLE_KEY environment variable is set"
fi

echo ""
echo "After successful migration, you can test the sync conflicts feature."
