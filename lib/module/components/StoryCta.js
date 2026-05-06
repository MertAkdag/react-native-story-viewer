"use strict";

/**
 * StoryCta — Call-to-Action Overlay Button
 *
 * Action button displayed at the bottom of the story.
 * - Shows CTA label (e.g. "View Product", "See Campaign")
 * - Gives swipe-up feel with an up arrow
 * - Attracts attention with subtle bounce animation
 * - Remains readable over media with glassmorphism background
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StoryCta({
  cta,
  onPress,
  renderCtaIcon
}) {
  // Up-down "bounce" animation — attracts user attention
  const bounceY = useSharedValue(0);
  useEffect(() => {
    bounceY.value = withRepeat(withSequence(withTiming(-4, {
      duration: 600,
      easing: Easing.inOut(Easing.ease)
    }), withTiming(0, {
      duration: 600,
      easing: Easing.inOut(Easing.ease)
    })), -1,
    // infinite repeat
    false);
  }, [bounceY]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: bounceY.value
    }]
  }));
  return /*#__PURE__*/_jsx(Animated.View, {
    style: [styles.wrapper, animatedStyle],
    children: /*#__PURE__*/_jsxs(TouchableOpacity, {
      style: styles.button,
      onPress: onPress,
      activeOpacity: 0.8,
      children: [renderCtaIcon ? renderCtaIcon() : /*#__PURE__*/_jsx(Text, {
        style: styles.defaultIcon,
        children: "\u25B4"
      }), /*#__PURE__*/_jsx(Text, {
        style: styles.label,
        numberOfLines: 1,
        children: cta.label
      })]
    })
  });
}
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    // Glassmorphism effect
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  defaultIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: -2 // Optical alignment for the triangle
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 1
    },
    textShadowRadius: 3
  }
});
//# sourceMappingURL=StoryCta.js.map