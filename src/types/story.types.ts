import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/** CTA (Call-to-Action) button data */
export type StoryCtaData = {
  type: string;
  value: string;
  label: string;
};

/** Metadata reported when story media finishes loading */
export type StoryMediaReadyMeta = {
  /** Natural media duration in milliseconds (automatically detected for videos) */
  durationMs?: number;
};

/** A single story item */
export type StoryItem = {
  id: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  posterUrl?: string | null;
  mediaType: 'image' | 'video';
  /** Display duration in milliseconds. For videos, auto-detected if omitted. */
  durationMs?: number;
  /** Optional relative time label shown next to the group name (e.g. "2h", "Just now") */
  timestamp?: string;
  isSeen?: boolean;
  cta?: StoryCtaData | null;
  [key: string]: any;
};

/** A story group containing one or more stories */
export type StoryGroup = {
  id: string;
  name: string;
  avatarUrl: string;
  isSeen?: boolean;
  stories: StoryItem[];
  [key: string]: any;
};

/** Story viewer lifecycle & interaction callbacks */
export type StoryViewerCallbacks = {
  /** Triggered when the story viewer should close */
  onClose: () => void;
  /** Triggered when the bottom CTA button is pressed */
  onCtaPress?: (cta: StoryCtaData, story: StoryItem, group: StoryGroup) => void;
  /** Triggered whenever the active story changes */
  onStoryChange?: (story: StoryItem, group: StoryGroup, storyIndex: number) => void;
  /** Triggered when transitioning to another story group */
  onGroupChange?: (group: StoryGroup, groupIndex: number) => void;
  /** Triggered when the last story of the last group finishes */
  onComplete?: () => void;
  /** Triggered when a story becomes visible so you can mark it as seen */
  onStorySeen?: (story: StoryItem, group: StoryGroup) => void;
};

/** Visual theme tokens shared across StoryViewer and StoryAvatarList */
export type StoryViewerTheme = {
  /** Ring color for already-seen story groups. @default '#9CA3AF' */
  seenRingColor?: string;
  /** Ring color for unseen story groups. @default '#E1306C' */
  unseenRingColor?: string;
  /** Viewer backdrop color. @default '#000000' */
  backgroundColor?: string;
  /** Progress bar fill color. @default '#FFFFFF' */
  progressActiveColor?: string;
  /** Progress bar track color. @default 'rgba(255, 255, 255, 0.32)' */
  progressInactiveColor?: string;
};

/** Behavioral configuration of the StoryViewer component */
export type StoryViewerConfig = {
  /** Default display duration (ms) for images or videos without known duration. @default 5000 */
  defaultDurationMs?: number;
  /** Minimum downward swipe distance (px) required to dismiss the viewer. @default 150 */
  dismissThreshold?: number;
  /** Minimum horizontal swipe distance (px) required to switch groups. @default 60 */
  swipeHorizontalThreshold?: number;
  /** Start video stories muted by default. @default false */
  defaultMuted?: boolean;
  /** Show a mute/unmute toggle button in the header for video stories. @default true */
  showMuteButton?: boolean;
  /** Automatically open each group at its first unseen story (`isSeen !== true`). @default true */
  startFromFirstUnseen?: boolean;
  /** Prefetch upcoming story images/posters in the background for instant transitions. @default true */
  prefetchNextMedia?: boolean;
  /** Automatically pause story progress when the CTA button is pressed. @default true */
  pauseOnCtaPress?: boolean;
};

/** Custom render slots for overriding specific UI parts without going fully headless */
export type StoryViewerComponents = {
  /** Custom render function for the header close button */
  renderCloseButton?: () => ReactNode;
  /** Custom render function for the header mute/unmute icon */
  renderMuteButton?: (isMuted: boolean) => ReactNode;
  /** Custom render function for the CTA leading icon */
  renderCtaIcon?: () => ReactNode;
  /** Replace the entire header area */
  renderHeader?: (props: StoryHeaderProps) => ReactNode;
  /** Render custom footer content at the bottom of the active story */
  renderFooter?: (story: StoryItem, group: StoryGroup) => ReactNode;
};

/** Props for the main `<StoryViewer />` component */
export type StoryViewerProps = {
  /** Story groups to display */
  groups: StoryGroup[];
  /** Index of the group to open initially. @default 0 */
  initialGroupIndex?: number;
  /** Explicit story index within the initial group (overrides `startFromFirstUnseen`) */
  initialStoryIndex?: number;
  /** Controls modal visibility */
  isVisible: boolean;
  /** Behavioral configuration */
  config?: StoryViewerConfig;
  /** Custom UI render overrides */
  customComponents?: StoryViewerComponents;
  /** Visual theme overrides */
  theme?: StoryViewerTheme;
} & StoryViewerCallbacks;

/** Props for `<StoryProgressBar />` */
export type StoryProgressBarProps = {
  /** Total number of stories in the active group */
  totalCount: number;
  /** 0-based index of the currently active story */
  currentIndex: number;
  /** Progress value between 0 and 1 (Reanimated SharedValue) */
  progress: SharedValue<number>;
  /** Fill color for completed and active segments. @default '#FFFFFF' */
  activeColor?: string;
  /** Track color for upcoming segments. @default 'rgba(255, 255, 255, 0.32)' */
  inactiveColor?: string;
};

/** Props for `<StoryHeader />` */
export type StoryHeaderProps = {
  avatarUrl: string;
  name: string;
  timestamp?: string;
  ringColor?: string;
  showMuteButton?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onClose: () => void;
  renderMuteButton?: (isMuted: boolean) => ReactNode;
  renderCloseButton?: () => ReactNode;
};

/** Props for `<StoryMedia />` */
export type StoryMediaProps = {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  posterUrl?: string | null;
  isPaused?: boolean;
  isMuted?: boolean;
  onMediaReady?: (meta?: StoryMediaReadyMeta) => void;
  onVideoEnd?: () => void;
};

/** Props for `<StoryCta />` */
export type StoryCtaProps = {
  cta: StoryCtaData;
  onPress: () => void;
  renderCtaIcon?: () => ReactNode;
};

/** Props for `<StoryAvatarList />` (horizontal story ring tray) */
export type StoryAvatarListProps = {
  /** Story groups to display in the horizontal tray */
  groups: StoryGroup[];
  /** Called with the tapped group and its original index in `groups` */
  onGroupPress: (group: StoryGroup, originalIndex: number) => void;
  /** Avatar image diameter in pixels. @default 68 */
  avatarSize?: number;
  /** Status ring stroke width in pixels. @default 2.5 */
  ringWidth?: number;
  /** Spacing between items in pixels. @default 14 */
  gap?: number;
  /** Display group names below each avatar. @default true */
  showNames?: boolean;
  /** Label color for unseen groups. @default '#111827' */
  nameColor?: string;
  /** Label color for seen groups. @default '#6B7280' */
  seenNameColor?: string;
  /** Render unseen groups before seen groups while keeping `originalIndex` intact. @default false */
  sortUnseenFirst?: boolean;
  /** Ring color customization */
  theme?: Pick<StoryViewerTheme, 'seenRingColor' | 'unseenRingColor'>;
  /** Style applied to the FlatList wrapper */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the FlatList inner content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Custom renderer for each avatar item */
  renderAvatarItem?: (params: {
    group: StoryGroup;
    index: number;
    isSeen: boolean;
    onPress: () => void;
  }) => ReactNode;
};
