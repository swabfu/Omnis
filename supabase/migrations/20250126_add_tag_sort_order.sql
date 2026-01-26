-- Migration: Add sort_order column to tags table
-- This migration adds a sort_order column to enable custom tag ordering

-- Add the sort_order column with a default value
ALTER TABLE tags ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing tags to have sequential sort_order based on creation time
-- This preserves the original order as much as possible
WITH numbered_tags AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS new_order
  FROM tags
  WHERE sort_order = 0
)
UPDATE tags
SET sort_order = numbered_tags.new_order
FROM numbered_tags
WHERE tags.id = numbered_tags.id;
