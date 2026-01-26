interface Metadata {
  title?: string
  description?: string
  image?: string
}

export async function fetchMetadata(url: string): Promise<Metadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Omnis/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return {}
    }

    const html = await response.text()
    const metadata: Metadata = {}

    // Extract OpenGraph tags
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)
    const twitterTitle = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i)
    metadata.title = ogTitle?.[1] || twitterTitle?.[1]

    const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)
    const twitterDesc = html.match(/<meta\s+name="twitter:description"\s+content="([^"]*)"/i)
    metadata.description = ogDesc?.[1] || twitterDesc?.[1]

    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i)
    const twitterImage = html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i)
    metadata.image = ogImage?.[1] || twitterImage?.[1]

    // Fallback to title tag
    if (!metadata.title) {
      const titleTag = html.match(/<title>([^<]*)<\/title>/i)
      metadata.title = titleTag?.[1]
    }

    return metadata
  } catch {
    return {}
  }
}

export function isTweetUrl(url: string): boolean {
  return /(twitter|x)\.com/.test(url)
}

export function extractTweetId(url: string): string | null {
  const match = url.match(/(twitter|x)\.com\/\w+\/status\/(\d+)/)
  return match?.[2] || null
}
