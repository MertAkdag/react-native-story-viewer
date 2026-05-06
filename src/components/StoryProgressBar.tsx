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
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type StoryProgressBarProps = {
  /** Total number of stories — determines how many segments are shown */
  totalCount: number;
  /** Index of currently active story (0-based) */
  currentIndex: number;
  /** Progress value between 0 → 1 — Reanimated SharedValue */
  progress: SharedValue<number>;
};

/**
 * Individual progress segment component.
 * Memoized for performance — re-renders only when its own state changes.
 */
const ProgressSegment = React.memo(function ProgressSegment({
  state,
  progress,
}: {
  /** Segment state: 'past' (filled), 'active' (animated), 'future' (empty) */
  state: 'past' | 'active' | 'future';
  progress: SharedValue<number>;
}) {
  // Create animated style only for active segment
  // static style is used for past and future
  const animatedFillStyle = useAnimatedStyle(() => {
    if (state !== 'active') return { width: '0%' };
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.segmentBackground}>
      {state === 'past' && <View style={[styles.segmentFill, styles.fullWidth]} />}
      {state === 'active' && <Animated.View style={[styles.segmentFill, animatedFillStyle]} />}
      {/* future state: only background visible, no fill */}
    </View>
  );
});

export function StoryProgressBar({
  totalCount,
  currentIndex,
  progress,
}: StoryProgressBarProps) {
  if (totalCount <= 0) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: totalCount }, (_, index) => {
        let state: 'past' | 'active' | 'future';
        if (index < currentIndex) state = 'past';
        else if (index === currentIndex) state = 'active';
        else state = 'future';

        return (
          <ProgressSegment
            key={index}
            state={state}
            progress={progress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  segmentBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  fullWidth: {
    width: '100%',
  },
});