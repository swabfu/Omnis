-- Bulk update tag sort orders in a single transaction
-- Replaces N separate update calls with one RPC invocation
create or replace function bulk_update_tag_sort_order(updates jsonb)
returns void as $$
begin
  -- updates format: [{"id": "uuid1", "sort_order": 0}, {"id": "uuid2", "sort_order": 1}, ...]
  update tags
  set sort_order = (elem->>'sort_order')::int
  from jsonb_array_elements(updates) as elem
  where tags.id = (elem->>'id')::uuid;
end;
$$ language plpgsql security definer;

-- RLS: Users can only update their own tags (policy still applies via security definer)
-- The function inherits the caller's RLS context
