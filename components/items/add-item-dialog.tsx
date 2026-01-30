'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2, Tag as TagIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createTagAssociations } from '@/lib/supabase/tags'
import { fetchMetadata } from '@/lib/metadata'
import { ContentType } from '@/types/database'
import { useAuth } from '@/components/auth/auth-provider'
import { TagSelector } from './tag-selector'
import {
  typeIcons,
  typeColors,
  BADGE_ICON_SIZE,
  BADGE_ICON_STROKE_WIDTH,
  LARGE_ICON_SIZE,
  LARGE_ICON_STROKE_WIDTH,
} from '@/lib/type-icons'
import { TITLE_TRUNCATE_LENGTH, TRUNCATE_ELLIPSIS } from '@/lib/truncate-constants'
import { METADATA_DEBOUNCE_DELAY } from '@/lib/timeout-constants'

interface Tag {
  id: string
  name: string
  color?: string
}

interface AddItemDialogProps {
  onItemAdded?: () => void
  onTagCreated?: () => void
}

export function AddItemDialog({ onItemAdded, onTagCreated }: AddItemDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [metadataFetched, setMetadataFetched] = useState(false)
  const supabase = createClient()

  const resetForm = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setContent('')
    setImageFile(null)
    setSelectedTags([])
    setMetadataFetched(false)
  }

  // Auto-fetch metadata when URL is entered
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (url && !metadataFetched && isValidUrl(url)) {
        setFetching(true)
        try {
          const metadata = await fetchMetadata(url)
          setTitle(metadata.title || '')
          setDescription(metadata.description || '')
          setMetadataFetched(true)
            } catch {
          // Silently fail - user can manually enter title/description
        } finally {
          setFetching(false)
        }
      }
    }, METADATA_DEBOUNCE_DELAY)

    return () => clearTimeout(debounceTimer)
  }, [url, metadataFetched])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !user?.id) return

    setLoading(true)

    try {
      // Use current title/description (either from metadata fetch or manual entry)
      const finalTitle = title || url
      const finalDescription = description || ''

      // Determine type
      let type: ContentType = 'link'
      if (url.match(/(twitter|x)\.com/)) {
        type = 'tweet'
      }

      const { data: item } = await supabase.from('items').insert({
        user_id: user.id,
        type,
        url,
        title: finalTitle,
        description: finalDescription,
      }).select().single()

      if (item && selectedTags.length > 0) {
        await createTagAssociations(item.id, selectedTags.map(t => t.id), supabase)
      }

      // Reset and close
      resetForm()
      setOpen(false)
      onItemAdded?.()
        } catch {
      toast.error('Failed to add item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user?.id) return

    setLoading(true)

    try {
      const { data: item } = await supabase.from('items').insert({
        user_id: user.id,
        type: 'note',
        content: content.trim(),
        title: content.slice(0, TITLE_TRUNCATE_LENGTH) + (content.length > TITLE_TRUNCATE_LENGTH ? TRUNCATE_ELLIPSIS : ''),
      }).select().single()

      if (item && selectedTags.length > 0) {
        await createTagAssociations(item.id, selectedTags.map(t => t.id), supabase)
      }

      resetForm()
      setOpen(false)
      onItemAdded?.()
        } catch {
      toast.error('Failed to add note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !user?.id) return

    // Validate file size (10MB limit matching bucket policy)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (imageFile.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 10MB.')
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(imageFile.type)) {
      toast.error('Only PNG, JPEG, GIF, WebP, and SVG images are allowed.')
      return
    }

    setLoading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const { data: item, error: insertError } = await supabase.from('items').insert({
        user_id: user.id,
        type: 'image',
        image_path: filePath,
        title: imageFile.name,
      }).select().single()

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('items').remove([filePath])
        throw new Error(`Failed to save image record: ${insertError.message}`)
      }

      if (item && selectedTags.length > 0) {
        await createTagAssociations(item.id, selectedTags.map(t => t.id), supabase)
      }

      resetForm()
      setOpen(false)
      onItemAdded?.()
        } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image. Please try again.'
      toast.error(message)
      console.error('Image upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className={`mr-2 ${BADGE_ICON_SIZE}`} />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Omnis</DialogTitle>
          <DialogDescription>
            Save links, tweets, images, or notes to your second brain.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-1.5" asChild>
              <button type="button">
                <span className={typeColors.link}>
                  <typeIcons.link className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
                </span>
                Link
              </button>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5" asChild>
              <button type="button">
                <span className={typeColors.image}>
                  <typeIcons.image className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
                </span>
                Image
              </button>
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-1.5" asChild>
              <button type="button">
                <span className={typeColors.note}>
                  <typeIcons.note className={BADGE_ICON_SIZE} strokeWidth={BADGE_ICON_STROKE_WIDTH} />
                </span>
                Note
              </button>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <form onSubmit={handleUrlSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setMetadataFetched(false) // Re-fetch if URL changes
                  }}
                  onKeyDown={(e) => {
                    // Prevent Enter from submitting - user must click Save
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                  disabled={loading || fetching}
                />
                {fetching && (
                  <p className="text-xs text-muted-foreground">Fetching preview...</p>
                )}
              </div>
              {url && (
                <>
                  <div className="space-y-2">
                    <Input
                      placeholder="Title (optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TagIcon className={BADGE_ICON_SIZE} />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onTagCreated={onTagCreated}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !url}>
                {loading ? <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} /> : null}
                Save Link
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="image">
            <form onSubmit={handleImageUpload} className="space-y-4 mt-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
                <span className={typeColors.image}>
                  <typeIcons.image className={LARGE_ICON_SIZE} strokeWidth={LARGE_ICON_STROKE_WIDTH} />
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  {imageFile ? imageFile.name : 'Select an image to upload'}
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="mt-4"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TagIcon className={BADGE_ICON_SIZE} />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onTagCreated={onTagCreated}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !imageFile}>
                {loading ? <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} /> : null}
                Upload Image
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="note">
            <form onSubmit={handleNoteSubmit} className="space-y-4 mt-4">
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                rows={6}
                className="resize-none"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TagIcon className={BADGE_ICON_SIZE} />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onTagCreated={onTagCreated}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
                {loading ? <Loader2 className={`mr-2 ${BADGE_ICON_SIZE} animate-spin`} /> : null}
                Save Note
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
