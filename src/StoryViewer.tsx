import React, { useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StoryHeaderProps, StoryViewerProps } from './types/story.types';
import { useStoryViewer } from './hooks/useStoryViewer';
import { StoryProgressBar } from './components/StoryProgressBar';
import { StoryHeader } from './components/StoryHeader';
import { StoryMedia } from './components/StoryMedia';
import { StoryCta } from './components/StoryCta';
import { isStoryGroupSeen } from './utils/story.utils';

const DEFAULT_SEEN_RING = '#9CA3AF';
const DEFAULT_UNSEEN_RING = '#E1306C';

export default function StoryViewer(props: StoryViewerProps) {
  const {
    groups,
    initialGroupIndex,
    initialStoryIndex,
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

  // All hooks MUST run unconditionally before any early returns
  const insets = useSafeAreaInsets();
  const viewer = useStoryViewer({
    groups,
    initialGroupIndex,
    initialStoryIndex,
    isVisible,
    config,
    callbacks: {
      onClose,
      onCtaPress,
      onStoryChange,
      onGroupChange,
      onComplete,
      onStorySeen,
    },
  });

  const composedGesture = useMemo(
    () => Gesture.Simultaneous(viewer.panGesture, viewer.longPressGesture),
    [viewer.panGesture, viewer.longPressGesture],
  );

  if (!isVisible || !viewer.currentGroup || !viewer.currentStory) {
    return null;
  }

  const { currentGroup, currentStory } = viewer;
  const bgColor = theme?.backgroundColor || '#000000';
  const groupSeen = isStoryGroupSeen(currentGroup);
  const ringColor = groupSeen
    ? (theme?.seenRingColor ?? DEFAULT_SEEN_RING)
    : (theme?.unseenRingColor ?? DEFAULT_UNSEEN_RING);

  const showMuteButton =
    (config?.showMuteButton ?? true) && currentStory.mediaType === 'video';

  const headerProps: StoryHeaderProps = {
    avatarUrl: currentGroup.avatarUrl,
    name: currentGroup.name,
    timestamp: currentStory.timestamp,
    ringColor,
    showMuteButton,
    isMuted: viewer.isMuted,
    onToggleMute: viewer.toggleMute,
    onClose,
    renderMuteButton: customComponents?.renderMuteButton,
    renderCloseButton: customComponents?.renderCloseButton,
  };

  const hasBottomOverlay = Boolean(
    (currentStory.cta && onCtaPress) || customComponents?.renderFooter,
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView
        style={[styles.root, { backgroundColor: bgColor }]}
      >
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              styles.container,
              viewer.containerAnimatedStyle,
              { backgroundColor: bgColor },
            ]}
          >
            {/* 1. Background Media */}
            <StoryMedia
              mediaUrl={currentStory.mediaUrl}
              mediaType={currentStory.mediaType}
              posterUrl={currentStory.posterUrl}
              isPaused={viewer.isPaused}
              isMuted={viewer.isMuted}
              onMediaReady={viewer.notifyMediaReady}
              onVideoEnd={viewer.notifyVideoEnd}
            />

            {/* 2. Subtle Top & Bottom Readability Scrims */}
            <View
              pointerEvents="none"
              style={[styles.topScrim, { height: Math.max(insets.top, 20) + 84 }]}
            />
            {hasBottomOverlay ? (
              <View pointerEvents="none" style={styles.bottomScrim} />
            ) : null}

            {/* 3. Left / Right Tap Navigation Zones (35% back / 65% next) */}
            <View style={styles.touchAreas}>
              <TouchableWithoutFeedback onPress={viewer.handlePrev}>
                <View style={styles.touchLeft} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={viewer.handleNext}>
                <View style={styles.touchRight} />
              </TouchableWithoutFeedback>
            </View>

            {/* 4. Top Overlay: Progress Bar + Header (rendered above touch zones) */}
            <View
              pointerEvents="box-none"
              style={[styles.header, { top: Math.max(insets.top, 14) + 6 }]}
            >
              <StoryProgressBar
                totalCount={currentGroup.stories.length}
                currentIndex={viewer.currentStoryIndex}
                progress={viewer.progress}
                activeColor={theme?.progressActiveColor}
                inactiveColor={theme?.progressInactiveColor}
              />
              {customComponents?.renderHeader ? (
                customComponents.renderHeader(headerProps)
              ) : (
                <StoryHeader {...headerProps} />
              )}
            </View>

            {/* 5. Bottom Overlay: CTA Button or Custom Footer */}
            {currentStory.cta && onCtaPress ? (
              <StoryCta
                cta={currentStory.cta}
                onPress={() => {
                  if (config?.pauseOnCtaPress !== false) {
                    viewer.pauseProgress();
                  }
                  onCtaPress(currentStory.cta!, currentStory, currentGroup);
                }}
                renderCtaIcon={customComponents?.renderCtaIcon}
              />
            ) : null}

            {customComponents?.renderFooter ? (
              <View pointerEvents="box-none" style={styles.footerSlot}>
                {customComponents.renderFooter(currentStory, currentGroup)}
              </View>
            ) : null}
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128,
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
  },
  touchAreas: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchLeft: {
    flex: 35,
  },
  touchRight: {
    flex: 65,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  footerSlot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
