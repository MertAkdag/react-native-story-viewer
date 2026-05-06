"use strict";

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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Individual progress segment component.
 * Memoized for performance — re-renders only when its own state changes.
 */
const ProgressSegment = /*#__PURE__*/React.memo(function ProgressSegment({
  state,
  progress
}) {
  // Create animated style only for active segment
  // static style is used for past and future
  const animatedFillStyle = useAnimatedStyle(() => {
    if (state !== 'active') return {
      width: '0%'
    };
    return {
      width: `${progress.value * 100}%`
    };
  });
  return /*#__PURE__*/_jsxs(View, {
    style: styles.segmentBackground,
    children: [state === 'past' && /*#__PURE__*/_jsx(View, {
      style: [styles.segmentFill, styles.fullWidth]
    }), state === 'active' && /*#__PURE__*/_jsx(Animated.View, {
      style: [styles.segmentFill, animatedFillStyle]
    })]
  });
});
export function StoryProgressBar({
  totalCount,
  currentIndex,
  progress
}) {
  if (totalCount <= 0) return null;
  return /*#__PURE__*/_jsx(View, {
    style: styles.container,
    children: Array.from({
      length: totalCount
    }, (_, index) => {
      let state;
      if (index < currentIndex) state = 'past';else if (index === currentIndex) state = 'active';else state = 'future';
      return /*#__PURE__*/_jsx(ProgressSegment, {
        state: state,
        progress: progress
      }, index);
    })
  });
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10
  },
  segmentBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  segmentFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2
  },
  fullWidth: {
    width: '100%'
  }
});
//# sourceMappingURL=StoryProgressBar.js.map