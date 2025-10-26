import type { SongMetadata } from '@/api/musicMetadata'
import { musicMetadataApi } from '@/api/musicMetadata'

const metadataPromiseCache = new Map<string, Promise<SongMetadata | null>>()

export async function getSongMetadataCached(id: string): Promise<SongMetadata | null> {
  if (!metadataPromiseCache.has(id)) {
    metadataPromiseCache.set(id, musicMetadataApi.lookupSongMetadata(id))
  }
  return await metadataPromiseCache.get(id)!
}


