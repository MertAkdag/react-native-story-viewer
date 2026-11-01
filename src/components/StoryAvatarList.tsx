import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import type { StoryAvatarListProps, StoryGroup } from '../types/story.types';
import { isStoryGroupSeen } from '../utils/story.utils';

const DEFAULT_SEEN_RING = '#9CA3AF';
const DEFAULT_UNSEEN_RING = '#E1306C';

type AvatarEntry = {
  group: StoryGroup;
  originalIndex: number;
  isSeen: boolean;
};

export function StoryAvatarList({
  groups,
  onGroupPress,
  avatarSize = 68,
  ringWidth = 2.5,
  gap = 14,
  showNames = true,
  nameColor = '#111827',
  seenNameColor = '#6B7280',
  sortUnseenFirst = false,
  theme,
  style,
  contentContainerStyle,
  renderAvatarItem,
}: StoryAvatarListProps) {
  const seenRingColor = theme?.seenRingColor ?? DEFAULT_SEEN_RING;
  const unseenRingColor = theme?.unseenRingColor ?? DEFAULT_UNSEEN_RING;

  const entries = useMemo<AvatarEntry[]>(() => {
    const mapped = groups.map((group, originalIndex) => ({
      group,
      originalIndex,
      isSeen: isStoryGroupSeen(group),
    }));

    if (!sortUnseenFirst) {
      return mapped;
    }

    return [...mapped].sort((a, b) => {
      if (a.isSeen === b.isSeen) return a.originalIndex - b.originalIndex;
      return a.isSeen ? 1 : -1;
    });
  }, [groups, sortUnseenFirst]);

  const innerPadding = 3;
  const outerSize = avatarSize + (ringWidth + innerPadding) * 2;

  return (
    <FlatList
      horizontal
      data={entries}
      keyExtractor={(item) => item.group.id}
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[
        styles.defaultContentContainer,
        { gap },
        contentContainerStyle,
      ]}
      renderItem={({ item }) => {
        const handlePress = () => onGroupPress(item.group, item.originalIndex);

        if (renderAvatarItem) {
          return (
            <View>
              {renderAvatarItem({
                group: item.group,
                index: item.originalIndex,
                isSeen: item.isSeen,
                onPress: handlePress,
              })}
            </View>
          );
        }

        return (
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.itemWrapper,
              { width: outerSize + 6 },
              pressed && styles.itemPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.group.name} stories${item.isSeen ? ', seen' : ', unseen'}`}
          >
            <View
              style={[
                styles.ring,
                {
                  width: outerSize,
                  height: outerSize,
                  borderRadius: outerSize / 2,
                  borderWidth: ringWidth,
                  padding: innerPadding,
                  borderColor: item.isSeen ? seenRingColor : unseenRingColor,
                },
              ]}
            >
              <Image
                source={{ uri: item.group.avatarUrl }}
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  backgroundColor: '#E5E7EB',
                }}
                contentFit="cover"
                transition={150}
              />
            </View>

            {showNames ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.name,
                  {
                    color: item.isSeen ? seenNameColor : nameColor,
                    fontWeight: item.isSeen ? '400' : '600',
                  },
                ]}
              >
                {item.group.name}
              </Text>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  defaultContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemWrapper: {
    alignItems: 'center',
  },
  itemPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
});
