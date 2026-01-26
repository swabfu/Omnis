'use client'

import { useState } from 'react'
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
import { Plus, Link2, Image as ImageIcon, FileText, Loader2, Tag as TagIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchMetadata } from '@/lib/metadata'
import { ContentType } from '@/types/database'
import { useAuth } from '@/components/auth/auth-provider'
import { TagSelector } from './tag-selector'

interface Tag {
  id: string
  name: string
}

interface AddItemDialogProps {
  onItemAdded?: () => void
}

export function AddItemDialog({ onItemAdded }: AddItemDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const supabase = createClient()

  const resetForm = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setContent('')
    setImageFile(null)
    setSelectedTags([])
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || !user?.id) return

    setLoading(true)

    try {
      // Auto-fetch metadata
      const metadata = await fetchMetadata(url)
      const finalTitle = title || metadata.title || url
      const finalDescription = description || metadata.description || ''

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
        // Associate tags with item
        const tagAssociations = selectedTags.map(tag => ({
          item_id: item.id,
          tag_id: tag.id
        }))
        await supabase.from('item_tags').insert(tagAssociations)
      }

      // Reset and close
      resetForm()
      setOpen(false)
      onItemAdded?.()
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item. Please try again.')
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
        title: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      }).select().single()

      if (item && selectedTags.length > 0) {
        const tagAssociations = selectedTags.map(tag => ({
          item_id: item.id,
          tag_id: tag.id
        }))
        await supabase.from('item_tags').insert(tagAssociations)
      }

      resetForm()
      setOpen(false)
      onItemAdded?.()
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !user?.id) return

    setLoading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: item } = await supabase.from('items').insert({
        user_id: user.id,
        type: 'image',
        image_path: filePath,
        title: imageFile.name,
      }).select().single()

      if (item && selectedTags.length > 0) {
        const tagAssociations = selectedTags.map(tag => ({
          item_id: item.id,
          tag_id: tag.id
        }))
        await supabase.from('item_tags').insert(tagAssociations)
      }

      resetForm()
      setOpen(false)
      onItemAdded?.()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
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
          <Plus className="mr-2 h-4 w-4" />
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
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-1" />
              Link
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-1" />
              Image
            </TabsTrigger>
            <TabsTrigger value="note">
              <FileText className="h-4 w-4 mr-1" />
              Note
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            <form onSubmit={handleUrlSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
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
                  <TagIcon className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !url}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Link
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="image">
            <form onSubmit={handleImageUpload} className="space-y-4 mt-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
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
                  <TagIcon className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !imageFile}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                  <TagIcon className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Note
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
