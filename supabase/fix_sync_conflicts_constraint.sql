-- Fix for sync_conflicts table constraint issue
-- This migration adds a proper unique constraint and updates the existing one

-- Drop the conditional unique index that's causing issues
DROP INDEX IF EXISTS idx_sync_conflicts_unique;

-- Create a regular unique constraint for active conflicts
-- We'll handle duplicates in the application logic instead
CREATE UNIQUE INDEX idx_sync_conflicts_unique_simple ON sync_conflicts(user_id, item_type, item_id, field, status);

-- Alternative: Create a simpler constraint without status if the above doesn't work
-- CREATE UNIQUE INDEX idx_sync_conflicts_unique_no_status ON sync_conflicts(user_id, item_type, item_id, field);

-- Add a comment to explain the constraint
COMMENT ON INDEX idx_sync_conflicts_unique_simple IS 'Prevents duplicate conflicts for the same user, item, field, and status';
