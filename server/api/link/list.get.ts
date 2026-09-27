import { FolderFilterSchema } from '#shared/schemas/folder'
import { ListLinksQuerySchema } from '#shared/schemas/link'

defineRouteMeta({
  openAPI: {
    description: 'List all short links with pagination',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 20, maximum: 1000 },
        description: 'Maximum number of links to return',
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Pagination cursor from previous response',
      },
      {
        name: 'sort',
        in: 'query',
        required: false,
        schema: { type: 'string', enum: ['az', 'za', 'newest', 'oldest'], default: 'newest' },
        description: 'Link sort order',
      },
      {
        name: 'tag',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Exact normalized tag filter',
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: { type: 'string', enum: ['active', 'expired', 'all'], default: 'active' },
        description: 'Expiration status filter',
      },
      {
        name: 'folder',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Folder id to list, or "none" for links that are not in any folder. Omit to list every folder.',
      },
    ],
  },
})

// The folder filter stays REST-only: MCP has no tool to discover folder ids.
const ListQuerySchema = ListLinksQuerySchema.extend({
  folder: FolderFilterSchema,
})

export default eventHandler(async (event) => {
  const { limit, cursor, sort, tag, status, folder } = await getValidatedQuery(event, ListQuerySchema.parse)

  const list = await listLinks(event, { limit, cursor, sort, tag, status, folder })
  return {
    ...list,
    links: sanitizeLinksPassword(list.links),
  }
})
