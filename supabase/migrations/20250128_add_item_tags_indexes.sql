-- Add indexes for item_tags junction table
-- Critical for tag filtering performance - without these, queries do full table scans

-- Index on tag_id for lookups from tag → items
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

-- Composite index for tag filtering with item lookups
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_item ON item_tags(tag_id, item_id);

-- Index on item_id for reverse lookups (item → tags)
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
