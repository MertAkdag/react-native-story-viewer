import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import type { StoryHeaderProps } from '../types/story.types';

export function StoryHeader({
  avatarUrl,
  name,
  timestamp,
  ringColor,
  showMuteButton = false,
  isMuted = false,
  onToggleMute,
  onClose,
  renderMuteButton,
  renderCloseButton,
}: StoryHeaderProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Avatar + Name + Timestamp */}
      <View style={styles.userInfo} pointerEvents="none">
        <Image
          source={{ uri: avatarUrl }}
          style={[
            styles.avatar,
            ringColor ? { borderColor: ringColor } : null,
          ]}
          contentFit="cover"
        />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {timestamp ? (
          <Text style={styles.timestamp} numberOfLines={1}>
            {timestamp}
          </Text>
        ) : null}
      </View>

      {/* Action Buttons: Mute + Close */}
      <View style={styles.actions} pointerEvents="box-none">
        {showMuteButton && onToggleMute ? (
          <TouchableOpacity
            onPress={onToggleMute}
            hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute story' : 'Mute story'}
          >
            {renderMuteButton ? (
              renderMuteButton(isMuted)
            ) : (
              <View style={styles.muteBadge}>
                <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Close story viewer"
        >
          {renderCloseButton ? (
            renderCloseButton()
          ) : (
            <Text style={styles.defaultCloseIcon}>✕</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    flexShrink: 1,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIcon: {
    fontSize: 15,
  },
  defaultCloseIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    paddingHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
