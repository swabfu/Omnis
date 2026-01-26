-- Migration: Add color column to tags table
-- This migration adds a color column to the tags table for tag customization

-- Add the color column with a default blue color
ALTER TABLE tags ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Update any existing tags that don't have a color set (NULL) to the default
UPDATE tags SET color = '#3b82f6' WHERE color IS NULL;
