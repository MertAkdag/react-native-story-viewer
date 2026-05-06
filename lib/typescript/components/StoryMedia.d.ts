/**
 * StoryMedia — Story Media Renderer
 *
 * Renders the background media of the story:
 * - `image` → full-screen display with expo-image
 * - `video` → with expo-video VideoView component
 *
 * Performance:
 * - expo-image already uses disk/memory cache
 * - Video `shouldPlay` and `isLooping` controls are managed via `isPaused` prop
 *
 * Synchronization:
 * - Progress bar doesn't start until `onMediaReady` callback is triggered
 * - Transitions to the next story when the video ends via `onVideoEnd` callback
 *
 * Error state:
 * - Shows a black background if media fails to load (graceful degradation)
 */
import React from 'react';
import type { StoryMediaProps } from '../types/story.types';
export declare function StoryMedia({ mediaUrl, mediaType, posterUrl, isPaused, onMediaReady, onVideoEnd, }: StoryMediaProps): React.JSX.Element;
//# sourceMappingURL=StoryMedia.d.ts.map