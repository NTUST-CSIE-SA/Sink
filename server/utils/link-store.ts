import type { H3Event } from 'h3'
import type { Link } from '#shared/schemas/link'
import type { LinkSearchItem } from '#shared/types/link'
import type { ExpectedLinkVersion, LinkFilterOptions, ListLinksOptions, ListLinksResult, SearchLinksOptions } from '../services/link-store/d1'
import { getRequestHost, getRequestProtocol } from 'h3'
import {
  d1CountLinks,
  d1CreateLink,
  d1CreateLinks,
  d1DeleteLink,
  d1GetActiveLink,
  d1GetAnyLink,
  d1GetLinkWithMetadata,
  d1IterateAllLinks,
  d1ListLinks,
  d1ListTags,
  d1SearchLinks,
  d1UpdateLink,
} from '../services/link-store/d1'

export function normalizeSlug(event: H3Event, slug: string): string {
  const { caseSensitive } = useRuntimeConfig(event)
  return caseSensitive ? slug : slug.toLowerCase()
}

export function buildShortLink(event: H3Event, slug: string): string {
  return `${getRequestProtocol(event)}://${getRequestHost(event)}/${slug}`
}

/** The active (unexpired) link for a slug. */
export async function getLink(event: H3Event, slug: string): Promise<Link | null> {
  return await d1GetActiveLink(event, slug)
}

/** The link for a slug, expired or not. */
export async function getAnyLink(event: H3Event, slug: string): Promise<Link | null> {
  return await d1GetAnyLink(event, slug)
}

export async function getLinkWithMetadata(event: H3Event, slug: string): Promise<{ link: Link | null, metadata: Record<string, unknown> | null }> {
  return await d1GetLinkWithMetadata(event, slug)
}

export async function createLink(event: H3Event, link: Link): Promise<boolean> {
  return await d1CreateLink(event, link)
}

export type CreateLinksResult = { created: boolean } | { error: unknown }

export async function createLinks(event: H3Event, links: Link[]): Promise<CreateLinksResult[]> {
  try {
    return (await d1CreateLinks(event, links)).map(created => ({ created }))
  }
  catch {
    // One bad row fails the whole batch, so retry row by row to report each outcome.
    const fallbackResults: CreateLinksResult[] = []
    for (const link of links) {
      try {
        fallbackResults.push({ created: await createLink(event, link) })
      }
      catch (error) {
        fallbackResults.push({ error })
      }
    }
    return fallbackResults
  }
}

export async function updateLink(event: H3Event, link: Link, expected?: ExpectedLinkVersion): Promise<boolean> {
  return await d1UpdateLink(event, link, expected)
}

export async function deleteLink(event: H3Event, slug: string): Promise<void> {
  await d1DeleteLink(event, slug)
}

export async function listLinks(event: H3Event, options: ListLinksOptions): Promise<ListLinksResult> {
  return await d1ListLinks(event, options)
}

export function iterateAllLinks(env: Cloudflare.Env): AsyncIterable<Link> {
  return d1IterateAllLinks(env)
}

export async function searchLinks(event: H3Event, options: SearchLinksOptions): Promise<LinkSearchItem[]> {
  return await d1SearchLinks(event, options)
}

export async function countLinks(event: H3Event, options: LinkFilterOptions): Promise<number> {
  return await d1CountLinks(event, options)
}

export async function listTags(event: H3Event): Promise<{ name: string, count: number }[]> {
  return await d1ListTags(event)
}
