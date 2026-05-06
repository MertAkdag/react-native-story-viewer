/**
 * useStoryViewer — Story Viewer Business Logic Hook
 *
 * This hook encapsulates ALL state management, animation logic,
 * gesture handling, and seen-tracking functions of the StoryViewer component.
 *
 * The component itself (StoryViewer.tsx) remains a thin "orchestrator",
 * while this hook acts as the "brain".
 */
import type { StoryGroup, StoryItem, StoryViewerConfig, StoryViewerCallbacks } from '../types/story.types';
export declare function useStoryViewer(params: {
    groups: StoryGroup[];
    initialGroupIndex?: number;
    isVisible: boolean;
    config?: StoryViewerConfig;
    callbacks: StoryViewerCallbacks;
}): {
    currentGroup: StoryGroup;
    currentStory: StoryItem;
    currentGroupIndex: number;
    currentStoryIndex: number;
    isPaused: boolean;
    isMediaReady: boolean;
    progress: import("react-native-reanimated").SharedValue<number>;
    translateY: import("react-native-reanimated").SharedValue<number>;
    containerAnimatedStyle: import("react-native-reanimated/lib/typescript/hook/commonTypes").AnimatedStyleHandle<{
        transform: {
            translateY: number;
        }[];
    }>;
    panGesture: import("react-native-gesture-handler/lib/typescript/handlers/gestures/panGesture").PanGesture;
    longPressGesture: import("react-native-gesture-handler/lib/typescript/handlers/gestures/longPressGesture").LongPressGesture;
    handleNext: () => void;
    handlePrev: () => void;
    pauseProgress: () => void;
    resumeProgress: () => void;
    notifyMediaReady: () => void;
    notifyVideoEnd: () => void;
};
//# sourceMappingURL=useStoryViewer.d.ts.map