/**
 * StoryProgressBar — Animated Story Progress Bar
 *
 * Instagram/Snapchat style segmented progress bar.
 * Each segment represents a story:
 *  - Past stories → completely filled (white)
 *  - Active story     → animated fill (with SharedValue)
 *  - Future stories → semi-transparent background
 *
 * Provides 60fps animation without blocking JS thread
 * using Reanimated SharedValue.
 */
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
type StoryProgressBarProps = {
    /** Total number of stories — determines how many segments are shown */
    totalCount: number;
    /** Index of currently active story (0-based) */
    currentIndex: number;
    /** Progress value between 0 → 1 — Reanimated SharedValue */
    progress: SharedValue<number>;
};
export declare function StoryProgressBar({ totalCount, currentIndex, progress, }: StoryProgressBarProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=StoryProgressBar.d.ts.map