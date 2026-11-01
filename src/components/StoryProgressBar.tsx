import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { StoryProgressBarProps } from '../types/story.types';

const DEFAULT_ACTIVE_COLOR = '#FFFFFF';
const DEFAULT_INACTIVE_COLOR = 'rgba(255, 255, 255, 0.32)';

const ProgressSegment = React.memo(function ProgressSegment({
  state,
  progress,
  activeColor,
  inactiveColor,
}: {
  state: 'past' | 'active' | 'future';
  progress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}) {
  const animatedFillStyle = useAnimatedStyle(() => {
    if (state !== 'active') return { width: '0%' };
    const clamped = Math.max(0, Math.min(1, progress.value));
    return {
      width: `${clamped * 100}%`,
    };
  });

  return (
    <View style={[styles.segmentBackground, { backgroundColor: inactiveColor }]}>
      {state === 'past' && (
        <View
          style={[
            styles.segmentFill,
            styles.fullWidth,
            { backgroundColor: activeColor },
          ]}
        />
      )}
      {state === 'active' && (
        <Animated.View
          style={[
            styles.segmentFill,
            { backgroundColor: activeColor },
            animatedFillStyle,
          ]}
        />
      )}
    </View>
  );
});

export function StoryProgressBar({
  totalCount,
  currentIndex,
  progress,
  activeColor = DEFAULT_ACTIVE_COLOR,
  inactiveColor = DEFAULT_INACTIVE_COLOR,
}: StoryProgressBarProps) {
  if (totalCount <= 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
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
            activeColor={activeColor}
            inactiveColor={inactiveColor}
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
    borderRadius: 2,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: 2,
  },
  fullWidth: {
    width: '100%',
  },
});
