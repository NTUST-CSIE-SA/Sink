import { env } from 'cloudflare:workers'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { deleteStoredLinks, fetch, postJson } from './utils'

// Analytics Engine rejects a data point whose blobs exceed 16 KB in total.
const MAX_BLOB_BYTES = 16 * 1024

const createdSlugs: string[] = []

afterAll(async () => {
  await deleteStoredLinks(createdSlugs)
})

describe('access log', () => {
  it('keeps a long destination URL within the Analytics Engine blob limit', async () => {
    const slug = `long-url-${crypto.randomUUID()}`
    createdSlugs.push(slug)
    // Exactly the default NUXT_PUBLIC_MAX_URL_LENGTH, so the URL blob alone fills 16 KB.
    const url = `https://example.com/${'a'.repeat(16_384 - 'https://example.com/'.length)}`
    const created = await postJson('/api/link/create', { url, slug })
    expect(created.status).toBe(201)

    const writeSpy = vi.spyOn(env.ANALYTICS, 'writeDataPoint')
    try {
      const response = await fetch(`/${slug}`, { redirect: 'manual' })
      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(url)

      expect(writeSpy).toHaveBeenCalledTimes(1)
      const blobs = writeSpy.mock.calls[0]![0]!.blobs as string[]
      expect(blobs[1], 'the URL blob keeps its prefix').toBe(url.slice(0, blobs[1]!.length))
      const bytes = blobs.reduce((total, blob) => total + new TextEncoder().encode(blob).length, 0)
      expect(bytes).toBeLessThanOrEqual(MAX_BLOB_BYTES)
    }
    finally {
      writeSpy.mockRestore()
    }
  })
})
