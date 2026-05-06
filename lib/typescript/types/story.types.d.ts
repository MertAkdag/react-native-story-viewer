import { ReactNode } from 'react';
/** CTA (Call-to-Action) button data */
export type StoryCtaData = {
    type: string;
    value: string;
    label: string;
};
/** A single story item */
export type StoryItem = {
    id: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    posterUrl?: string | null;
    mediaType: 'image' | 'video';
    durationMs?: number;
    isSeen?: boolean;
    cta?: StoryCtaData | null;
    [key: string]: any;
};
/** A story group (Contains multiple Stories) */
export type StoryGroup = {
    id: string;
    name: string;
    avatarUrl: string;
    isSeen?: boolean;
    stories: StoryItem[];
    [key: string]: any;
};
/** Story viewer event callbacks */
export type StoryViewerCallbacks = {
    /** Triggered when the story viewer is closed */
    onClose: () => void;
    /** Triggered when the CTA button is clicked */
    onCtaPress?: (cta: StoryCtaData, story: StoryItem, group: StoryGroup) => void;
    /** Triggered when the active story changes (for analytics, seen tracking, etc.) */
    onStoryChange?: (story: StoryItem, group: StoryGroup, index: number) => void;
    /** Triggered when all stories in a group are finished and transition to the next group occurs */
    onGroupChange?: (group: StoryGroup, index: number) => void;
    /** Triggered when the last story of the last group finishes (viewer is still open) */
    onComplete?: () => void;
    /** Triggered to mark a story as seen */
    onStorySeen?: (story: StoryItem, group: StoryGroup) => void;
};
/** Theme configuration for the Story viewer */
export type StoryViewerTheme = {
    /** Determines the ring color of seen story avatars. @default '#9CA3AF' (gray) */
    seenRingColor?: string;
    /** Determines the ring color of unseen story avatars. @default '#C9963B' (gold) */
    unseenRingColor?: string;
    /** Background color for the viewer */
    backgroundColor?: string;
};
/** Behavior configuration of the Story viewer component */
export type StoryViewerConfig = {
    /** Default story display duration (ms) if not provided in the story object. @default 5000 */
    defaultDurationMs?: number;
    /** Minimum swipe down distance required for closing (pixels). @default 150 */
    dismissThreshold?: number;
};
/** Custom rendering components for the Story viewer */
export type StoryViewerComponents = {
    /** Custom render function for the close button */
    renderCloseButton?: () => ReactNode;
    /** Custom render function for the CTA icon (e.g., swipe up arrow) */
    renderCtaIcon?: () => ReactNode;
};
/** Props of the StoryViewer component */
export type StoryViewerProps = {
    /** Story groups to show */
    groups: StoryGroup[];
    /** Which group to start with (default: 0) */
    initialGroupIndex?: number;
    /** Is viewer visible? */
    isVisible: boolean;
    /** Behavior configuration */
    config?: StoryViewerConfig;
    /** Custom rendering components */
    customComponents?: StoryViewerComponents;
    /** Theme customization */
    theme?: StoryViewerTheme;
} & StoryViewerCallbacks;
/** Props of the StoryProgressBar component */
export type StoryProgressBarProps = {
    totalCount: number;
    currentIndex: number;
    progress: {
        value: number;
    };
};
/** Props of the StoryHeader component */
export type StoryHeaderProps = {
    avatarUrl: string;
    name: string;
    onClose: () => void;
    renderCloseButton?: () => ReactNode;
};
/** Props of the StoryMedia component */
export type StoryMediaProps = {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    posterUrl?: string | null;
    isPaused?: boolean;
    onMediaReady?: () => void;
    onVideoEnd?: () => void;
};
/** Props of the StoryCta component */
export type StoryCtaProps = {
    cta: StoryCtaData;
    onPress: () => void;
    renderCtaIcon?: () => ReactNode;
};
//# sourceMappingURL=story.types.d.ts.map