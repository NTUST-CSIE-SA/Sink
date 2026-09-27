import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import type { Link } from '../../shared/schemas/link'
import { sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const folders = sqliteTable('folders', {
  id: text().primaryKey(),
  name: text().notNull(),
  // Self reference: deleting a parent promotes its children to the root level.
  parentId: text('parent_id').references((): AnySQLiteColumn => folders.id, { onDelete: 'set null' }),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, table => [
  // Deliberately no unique index on (parent, name). Deleting a folder promotes
  // its children one level up, where a same-named folder may already exist; a
  // hard constraint would fail the whole delete instead. Sibling names are kept
  // unique for user-initiated creates and renames in `link-store/folders.ts`,
  // so the only way to end up with duplicates is that promotion.
  index('folders_parent_id_idx').on(table.parentId),
])

export const links = sqliteTable('links', {
  slug: text().primaryKey(),
  id: text().notNull(),
  url: text().notNull(),
  comment: text(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  expiration: integer(),
  title: text(),
  description: text(),
  image: text(),
  apple: text(),
  google: text(),
  cloaking: integer({ mode: 'boolean' }),
  redirectWithQuery: integer('redirect_with_query', { mode: 'boolean' }),
  proxy: integer({ mode: 'boolean' }),
  password: text(),
  unsafe: integer({ mode: 'boolean' }),
  geo: text({ mode: 'json' }).$type<Link['geo']>(),
  normalizedUrl: text('normalized_url').notNull(),
  effectiveExpiresAt: integer('effective_expires_at'),
  // Deleting a folder moves its links back to the uncategorized root.
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
}, table => [
  index('links_created_at_slug_idx').on(table.createdAt, table.slug),
  index('links_created_at_desc_slug_idx').on(sql`${table.createdAt} desc`, table.slug),
  index('links_normalized_url_idx').on(table.normalizedUrl),
  index('links_id_idx').on(table.id),
  index('links_folder_id_created_at_desc_slug_idx').on(table.folderId, sql`${table.createdAt} desc`, table.slug),
])

export const tags = sqliteTable('tags', {
  name: text().primaryKey(),
})

export const linkTags = sqliteTable('link_tags', {
  linkSlug: text('link_slug').notNull().references(() => links.slug, { onDelete: 'cascade' }),
  tagName: text('tag_name').notNull().references(() => tags.name, { onDelete: 'cascade' }),
}, table => [
  primaryKey({ columns: [table.linkSlug, table.tagName] }),
  index('link_tags_tag_name_link_slug_idx').on(table.tagName, table.linkSlug),
])
