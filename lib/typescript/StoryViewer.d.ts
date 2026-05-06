/**
 * StoryViewer — Main Orchestrator Component
 *
 * Instagram/Snapchat style full-screen story viewer.
 *
 * This component is a "thin shell" — all business logic lives in the `useStoryViewer` hook,
 * all visual parts live in sub-components. This component only orchestrates them.
 *
 * Features:
 * ──────────
 * - ✅ Segmented progress bar (separate for each story, animated)
 * - ✅ Next/prev navigation with left/right tap
 * - ✅ Swipe down to close (with spring effect)
 * - ✅ Long press to pause/resume
 * - ✅ CTA buttons (optional)
 * - ✅ Image + Video media support
 * - ✅ Transition between groups
 *
 * @example
 * ```tsx
 * <StoryViewer
 *   groups={storyGroups}
 *   initialGroupIndex={0}
 *   isVisible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   onCtaPress={(cta) => router.push(cta.value)}
 *   onStorySeen={(story) => api.markSeen(story.id)}
 *   config={{ defaultDurationMs: 5000 }}
 * />
 * ```
 */
import React from 'react';
import type { StoryViewerProps } from './types/story.types';
export default function StoryViewer(props: StoryViewerProps): React.JSX.Element | null;
//# sourceMappingURL=StoryViewer.d.ts.map