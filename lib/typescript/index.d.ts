/**
 * Story SDK — Public API (Barrel Export)
 *
 * This file is the only entry point of the package to the outside world.
 * Users should only import from here:
 *
 * ```ts
 * import {
 *   StoryViewer,
 *   useStoryViewer,
 * } from './story';
 * ```
 *
 * When published as an NPM package in the future:
 *
 * ```ts
 * import { StoryViewer } from '@mertakdag/react-native-story-viewer';
 * ```
 */
export { default as StoryViewer } from './StoryViewer';
export { StoryProgressBar } from './components/StoryProgressBar';
export { StoryHeader } from './components/StoryHeader';
export { StoryMedia } from './components/StoryMedia';
export { StoryCta } from './components/StoryCta';
export { useStoryViewer } from './hooks/useStoryViewer';
export type { StoryCtaData, StoryItem, StoryGroup, StoryViewerTheme, StoryViewerConfig, StoryViewerComponents, StoryViewerCallbacks, StoryViewerProps, StoryProgressBarProps, StoryHeaderProps, StoryMediaProps, StoryCtaProps, } from './types/story.types';
//# sourceMappingURL=index.d.ts.map