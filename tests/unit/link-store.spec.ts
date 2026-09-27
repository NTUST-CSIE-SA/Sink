import type { H3Event } from 'h3'
import type { Link } from '../../shared/schemas/link'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLinks } from '../../server/utils/link-store'

const mocks = vi.hoisted(() => ({
  d1CreateLink: vi.fn(),
  d1CreateLinks: vi.fn(),
}))

vi.mock('../../server/services/link-store/d1', () => ({
  d1CountLinks: vi.fn(),
  d1CreateLink: mocks.d1CreateLink,
  d1CreateLinks: mocks.d1CreateLinks,
  d1DeleteLink: vi.fn(),
  d1GetActiveLink: vi.fn(),
  d1GetAnyLink: vi.fn(),
  d1GetLinkWithMetadata: vi.fn(),
  d1IterateAllLinks: vi.fn(),
  d1ListLinks: vi.fn(),
  d1ListTags: vi.fn(),
  d1SearchLinks: vi.fn(),
  d1UpdateLink: vi.fn(),
}))

function makeLink(slug: string): Link {
  return { id: `${slug}-id`, slug, url: 'https://example.com', createdAt: 1, updatedAt: 1, tags: [] }
}

describe('createLinks', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maps each batch result to its link', async () => {
    mocks.d1CreateLinks.mockResolvedValue([true, false])

    await expect(createLinks({} as H3Event, [makeLink('new'), makeLink('taken')]))
      .resolves
      .toEqual([{ created: true }, { created: false }])
    expect(mocks.d1CreateLink).not.toHaveBeenCalled()
  })

  it('retries row by row when the batch fails, so each link reports its own outcome', async () => {
    const failure = new Error('constraint failed')
    mocks.d1CreateLinks.mockRejectedValue(new Error('batch failed'))
    mocks.d1CreateLink
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(false)

    await expect(createLinks({} as H3Event, [makeLink('a'), makeLink('b'), makeLink('c')]))
      .resolves
      .toEqual([{ created: true }, { error: failure }, { created: false }])
    expect(mocks.d1CreateLink).toHaveBeenCalledTimes(3)
  })
})
