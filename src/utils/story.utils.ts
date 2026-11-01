import type { StoryGroup, StoryItem } from '../types/story.types';

/**
 * Determines whether an entire story group has been seen.
 * Returns `true` if all stories in the group have `isSeen === true`,
 * or if `group.isSeen === true` when individual stories aren't all tracked.
 */
export function isStoryGroupSeen(group: StoryGroup): boolean {
  if (!group.stories || group.stories.length === 0) {
    return Boolean(group.isSeen);
  }
  if (group.stories.every((story) => story.isSeen === true)) {
    return true;
  }
  return group.isSeen === true;
}

/**
 * Resolves which story index a group should start playing from.
 * - Uses `explicitIndex` (clamped) when provided.
 * - Otherwise jumps to the first unseen story (`isSeen !== true`) when `startFromFirstUnseen` is enabled.
 * - Falls back to `0` when all stories are already seen.
 */
export function resolveInitialStoryIndex(
  group: StoryGroup | undefined,
  explicitIndex?: number,
  startFromFirstUnseen: boolean = true,
): number {
  if (!group || group.stories.length === 0) {
    return 0;
  }

  const maxIndex = group.stories.length - 1;

  if (typeof explicitIndex === 'number' && Number.isFinite(explicitIndex)) {
    return Math.max(0, Math.min(Math.floor(explicitIndex), maxIndex));
  }

  if (startFromFirstUnseen) {
    const firstUnseenIndex = group.stories.findIndex((story) => !story.isSeen);
    if (firstUnseenIndex >= 0) {
      return firstUnseenIndex;
    }
  }

  return 0;
}

/**
 * Resolves the effective playback duration (in ms) for a story.
 * Priority:
 *  1. Explicit `story.durationMs` (if > 0)
 *  2. Auto-detected `detectedMediaDurationMs` for videos (if > 0)
 *  3. `defaultDurationMs`
 */
export function resolveStoryDurationMs(
  story: StoryItem | undefined,
  detectedMediaDurationMs?: number,
  defaultDurationMs: number = 5000,
): number {
  if (story?.durationMs && story.durationMs > 0 && Number.isFinite(story.durationMs)) {
    return story.durationMs;
  }

  if (
    story?.mediaType === 'video' &&
    detectedMediaDurationMs &&
    detectedMediaDurationMs > 0 &&
    Number.isFinite(detectedMediaDurationMs)
  ) {
    return detectedMediaDurationMs;
  }

  return defaultDurationMs;
}

function pickPrefetchableImageUrl(story: StoryItem | undefined): string | null {
  if (!story) return null;
  if (story.mediaType === 'image') {
    return story.mediaUrl || null;
  }
  return story.posterUrl || story.thumbnailUrl || null;
}

/**
 * Returns unique HTTP(S) image URLs that should be prefetched while viewing `(groupIndex, storyIndex)`:
 * - The next story inside the current group
 * - The entry story and avatar of the next group
 */
export function getPrefetchUrls(
  groups: StoryGroup[],
  groupIndex: number,
  storyIndex: number,
  startFromFirstUnseen: boolean = true,
): string[] {
  const urls = new Set<string>();
  const currentGroup = groups[groupIndex];

  if (currentGroup) {
    const nextStoryInGroup = currentGroup.stories[storyIndex + 1];
    const url = pickPrefetchableImageUrl(nextStoryInGroup);
    if (url && /^https?:\/\//i.test(url)) {
      urls.add(url);
    }
  }

  const nextGroup = groups[groupIndex + 1];
  if (nextGroup) {
    if (nextGroup.avatarUrl && /^https?:\/\//i.test(nextGroup.avatarUrl)) {
      urls.add(nextGroup.avatarUrl);
    }
    const nextGroupEntryIndex = resolveInitialStoryIndex(
      nextGroup,
      undefined,
      startFromFirstUnseen,
    );
    const entryUrl = pickPrefetchableImageUrl(nextGroup.stories[nextGroupEntryIndex]);
    if (entryUrl && /^https?:\/\//i.test(entryUrl)) {
      urls.add(entryUrl);
    }
  }

  return Array.from(urls);
}
