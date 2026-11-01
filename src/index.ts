// ── Main Components ──
export { default as StoryViewer } from './StoryViewer';
export { StoryAvatarList } from './components/StoryAvatarList';

// ── Composable Sub-components ──
export { StoryProgressBar } from './components/StoryProgressBar';
export { StoryHeader } from './components/StoryHeader';
export { StoryMedia } from './components/StoryMedia';
export { StoryCta } from './components/StoryCta';

// ── Headless Hook & Utilities ──
export { useStoryViewer } from './hooks/useStoryViewer';
export type { UseStoryViewerParams } from './hooks/useStoryViewer';
export {
  isStoryGroupSeen,
  resolveInitialStoryIndex,
  resolveStoryDurationMs,
  getPrefetchUrls,
} from './utils/story.utils';

// ── Public TypeScript Types ──
export type {
  StoryCtaData,
  StoryMediaReadyMeta,
  StoryItem,
  StoryGroup,
  StoryViewerTheme,
  StoryViewerConfig,
  StoryViewerComponents,
  StoryViewerCallbacks,
  StoryViewerProps,
  StoryProgressBarProps,
  StoryHeaderProps,
  StoryMediaProps,
  StoryCtaProps,
  StoryAvatarListProps,
} from './types/story.types';
