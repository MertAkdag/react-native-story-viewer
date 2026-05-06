/**
 * StoryViewer — Main Orchestrator Component
 *
 * Instagram/Snapchat/Whatsapp style full-screen story viewer.
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
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
} from 'react-native-gesture-handler';
import type { StoryViewerProps } from './types/story.types';
import { useStoryViewer } from './hooks/useStoryViewer';
import { StoryProgressBar } from './components/StoryProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryHeader } from './components/StoryHeader';
import { StoryMedia } from './components/StoryMedia';
import { StoryCta } from './components/StoryCta';

export default function StoryViewer(props: StoryViewerProps) {
  const {
    groups,
    initialGroupIndex,
    isVisible,
    config,
    theme,
    customComponents,
    onClose,
    onCtaPress,
    onStoryChange,
    onGroupChange,
    onComplete,
    onStorySeen,
  } = props;

  const viewer = useStoryViewer({
    groups,
    initialGroupIndex,
    isVisible,
    config,
    callbacks: { onClose, onCtaPress, onStoryChange, onGroupChange, onComplete, onStorySeen },
  });

  // Do not render if there is no data
  if (!viewer.currentGroup || !viewer.currentStory) return null;

  const { currentGroup, currentStory } = viewer;
  const insets = useSafeAreaInsets();

  const bgColor = theme?.backgroundColor || 'black';

  // Combine Pan + LongPress gestures
  // Simultaneous: both gestures can be active at the same time
  const composedGesture = Gesture.Simultaneous(
    viewer.panGesture,
    viewer.longPressGesture,
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <GestureHandlerRootView style={[styles.root, { backgroundColor: bgColor }]}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[styles.container, viewer.containerAnimatedStyle, { backgroundColor: bgColor }]}
          >
            {/* ── 1. Background Media ── */}
            <StoryMedia
              mediaUrl={currentStory.mediaUrl}
              mediaType={currentStory.mediaType}
              posterUrl={currentStory.posterUrl}
              isPaused={viewer.isPaused}
              onMediaReady={viewer.notifyMediaReady}
              onVideoEnd={viewer.notifyVideoEnd}
            />

            {/* ── 2. Top Layer: Progress Bar + Header ── */}
            <View style={[styles.header, { top: insets.top }]}>
              <StoryProgressBar
                totalCount={currentGroup.stories.length}
                currentIndex={viewer.currentStoryIndex}
                progress={viewer.progress}
              />
              <StoryHeader
                avatarUrl={currentGroup.avatarUrl}
                name={currentGroup.name}
                onClose={onClose}
                renderCloseButton={customComponents?.renderCloseButton}
              />
            </View>

            {/* ── 3. CTA Button (if any) ── */}
            {currentStory.cta && onCtaPress && (
              <StoryCta
                cta={currentStory.cta}
                onPress={() =>
                  onCtaPress(currentStory.cta!, currentStory, currentGroup)
                }
                renderCtaIcon={customComponents?.renderCtaIcon}
              />
            )}

            {/* ── 4. Touch Areas (Next / Prev) ── */}
            <View style={styles.touchAreas}>
              <TouchableWithoutFeedback onPress={viewer.handlePrev}>
                <View style={styles.touchLeft} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={viewer.handleNext}>
                <View style={styles.touchRight} />
              </TouchableWithoutFeedback>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  touchAreas: {
    flex: 1,
    flexDirection: 'row',
  },
  touchLeft: {
    flex: 1,
  },
  touchRight: {
    flex: 1,
  },
});
