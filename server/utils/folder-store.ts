import type { H3Event } from 'h3'
import type { CreateFolderInput, EditFolderInput, Folder, FolderWithCount, PortableFolder } from '#shared/schemas/folder'
import {
  d1CountUncategorizedLinks,
  d1CreateFolder,
  d1DeleteFolder,
  d1FolderExists,
  d1ImportFolders,
  d1ListFolderIds,
  d1ListFolders,
  d1MoveLinks,
  d1UpdateFolder,
} from '../services/link-store/folders'

export interface FolderListResult {
  folders: FolderWithCount[]
  uncategorizedCount: number
}

export async function listFolders(event: H3Event): Promise<FolderListResult> {
  const [folders, uncategorizedCount] = await Promise.all([
    d1ListFolders(event),
    d1CountUncategorizedLinks(event),
  ])
  return { folders, uncategorizedCount }
}

export async function folderExists(event: H3Event, id: string): Promise<boolean> {
  return await d1FolderExists(event, id)
}

/** Ids of every existing folder, for bulk validation such as import. */
export async function listFolderIds(event: H3Event): Promise<Set<string>> {
  return new Set(await d1ListFolderIds(event))
}

/** Restores exported folders, returning every folder id present afterwards. */
export async function importFolders(event: H3Event, incoming: PortableFolder[]): Promise<Set<string>> {
  return await d1ImportFolders(event, incoming)
}

/** Folders in export shape, for the export and backup envelopes. */
export async function listPortableFolders(event: H3Event): Promise<PortableFolder[]> {
  return (await d1ListFolders(event)).map(({ id, name, parentId }) => ({ id, name, parentId }))
}

export async function createFolder(event: H3Event, input: CreateFolderInput): Promise<Folder> {
  return await d1CreateFolder(event, input)
}

export async function updateFolder(event: H3Event, input: EditFolderInput): Promise<Folder> {
  return await d1UpdateFolder(event, input)
}

export async function deleteFolder(event: H3Event, id: string): Promise<boolean> {
  return await d1DeleteFolder(event, id)
}

export async function moveLinks(event: H3Event, slugs: string[], folderId: string | null): Promise<string[]> {
  return await d1MoveLinks(event, slugs, folderId)
}
