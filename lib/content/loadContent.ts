import seed from '@/content/seed.en.json';
import type { ContentPack } from '@/lib/types/game';

export async function loadDefaultContent(): Promise<ContentPack> {
  return seed as ContentPack;
}


