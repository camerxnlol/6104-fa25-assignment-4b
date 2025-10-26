import axios, { type AxiosInstance } from 'axios';

// Simple throttle: MusicBrainz asks for 1 req/sec for anonymous clients.
class RateLimiter {
  private nextAllowedTs = 0;
  private minIntervalMs: number;

  constructor(rps: number) {
    this.minIntervalMs = Math.max(1000 / Math.max(1, rps), 1000);
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const waitMs = Math.max(0, this.nextAllowedTs - now);
    if (waitMs > 0) {
      await new Promise((res) => setTimeout(res, waitMs));
    }
    this.nextAllowedTs = Date.now() + this.minIntervalMs;
  }
}

const mbClient: AxiosInstance = axios.create({
  baseURL: 'https://musicbrainz.org/ws/2',
  headers: {
    'Accept': 'application/json',
    // Recommend setting a proper User-Agent per MB guidelines. Adjust if you have an app name/contact.
    'User-Agent': '6104-fa25-assignment-4b/1.0 (contact: camholt@mit.edu)',
  },
  params: {
    fmt: 'json',
  },
  timeout: 12000,
});

const coverClient: AxiosInstance = axios.create({
  baseURL: 'https://coverartarchive.org',
  headers: {
    'Accept': 'application/json',
    'User-Agent': '6104-fa25-assignment-4b/1.0 (contact: camholt@mit.edu)',
  },
  timeout: 12000,
});

const limiter = new RateLimiter(1);

export interface SongMetadata {
  title: string;
  artist: string;
  artworkUrl?: string;
}

async function searchRecording(query: string): Promise<any | null> {
  await limiter.wait();
  const params = new URLSearchParams();
  params.set('query', query);
  params.set('limit', '1');
  // Include aliases, artist credits and releases as requested
  params.set('inc', 'aliases+artist-credits+releases');
  try {
    const { data } = await mbClient.get('/recording', { params });
    const recording = Array.isArray(data?.recordings) ? data.recordings[0] : null;
    return recording ?? null;
  } catch (e) {
    return null;
  }
}

function looksLikeMbId(value: string): boolean {
  // UUID v4 style MBID (case-insensitive)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

async function lookupRecordingByMbId(mbid: string): Promise<any | null> {
  await limiter.wait();
  const params = new URLSearchParams();
  params.set('inc', 'aliases+artist-credits+releases');
  try {
    const { data } = await mbClient.get(`/recording/${encodeURIComponent(mbid)}`, { params });
    return data ?? null;
  } catch (e) {
    return null;
  }
}

async function getPrimaryArtistName(recording: any): Promise<string> {
  // Try credited artist first
  const credit = Array.isArray(recording?.["artist-credit"]) ? recording["artist-credit"][0] : null;
  if (credit && typeof credit?.name === 'string') return credit.name;
  const artists = Array.isArray(recording?.artists) ? recording.artists : [];
  if (artists.length && typeof artists[0]?.name === 'string') return artists[0].name;
  return '';
}

async function getReleaseId(recording: any): Promise<string | undefined> {
  const releases = Array.isArray(recording?.releases) ? recording.releases : [];
  return releases.length ? releases[0].id : undefined;
}

async function getReleaseGroupId(recording: any): Promise<string | undefined> {
  const rgs = Array.isArray(recording?.['release-groups']) ? recording['release-groups'] : [];
  return rgs.length ? rgs[0].id : undefined;
}

async function getCoverArtUrl(releaseId?: string): Promise<string | undefined> {
  if (!releaseId) return undefined;
  await limiter.wait();
  try {
    const { data } = await coverClient.get(`/release/${releaseId}`);
    const images = Array.isArray(data?.images) ? data.images : [];
    const front = images.find((img: any) => img?.front) || images[0];
    return front?.thumbnails?.large || front?.image || front?.thumbnails?.small;
  } catch (_) {
    return undefined;
  }
}

async function getCoverArtUrlFromReleaseGroup(releaseGroupId?: string): Promise<string | undefined> {
  if (!releaseGroupId) return undefined;
  await limiter.wait();
  try {
    const { data } = await coverClient.get(`/release-group/${releaseGroupId}`);
    const images = Array.isArray(data?.images) ? data.images : [];
    const front = images.find((img: any) => img?.front) || images[0];
    return front?.thumbnails?.large || front?.image || front?.thumbnails?.small;
  } catch (_) {
    return undefined;
  }
}

export async function lookupSongMetadata(raw: string): Promise<SongMetadata | null> {
  // raw may be just an id or "artist - title"; we send as-is to MB search.
  const rec = looksLikeMbId(raw) ? await lookupRecordingByMbId(raw) : await searchRecording(raw);
  if (!rec) return null;
  const title: string = typeof rec?.title === 'string' ? rec.title : '';
  const artist: string = await getPrimaryArtistName(rec);
  const releaseId = await getReleaseId(rec);
  let artworkUrl = await getCoverArtUrl(releaseId);
  if (!artworkUrl) {
    const rgId = await getReleaseGroupId(rec);
    artworkUrl = await getCoverArtUrlFromReleaseGroup(rgId);
  }
  return { title, artist, artworkUrl };
}

export async function enrichMany(rawSongs: string[]): Promise<Record<string, SongMetadata | null>> {
  const results: Record<string, SongMetadata | null> = {};
  for (const raw of rawSongs) {
    results[raw] = await lookupSongMetadata(raw);
  }
  return results;
}

export const musicMetadataApi = {
  lookupSongMetadata,
  enrichMany,
};


