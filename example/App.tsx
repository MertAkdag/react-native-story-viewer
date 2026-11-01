import React, { useState, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  StoryAvatarList,
  StoryViewer,
  type StoryGroup,
  type StoryItem,
  type StoryCtaData,
} from '@mertakdag/react-native-story-viewer';

const INITIAL_GROUPS: StoryGroup[] = [
  {
    id: 'armillis',
    name: 'Armillis',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80',
    stories: [
      {
        id: 'arm-1',
        mediaType: 'image',
        mediaUrl:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80',
        timestamp: '2h',
        isSeen: false,
        cta: {
          type: 'link',
          value: 'https://armillis.com',
          label: 'Explore Armillis',
        },
      },
      {
        id: 'arm-2',
        mediaType: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        posterUrl:
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1080&q=80',
        timestamp: '1h',
        isSeen: false,
        cta: {
          type: 'product',
          value: 'tts-engine',
          label: 'Try Live Demo',
        },
      },
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&q=80',
    stories: [
      {
        id: 'stu-1',
        mediaType: 'image',
        mediaUrl:
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&q=80',
        timestamp: '4h',
        isSeen: false,
      },
      {
        id: 'stu-2',
        mediaType: 'image',
        mediaUrl:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
        timestamp: '3h',
        isSeen: false,
        cta: {
          type: 'collection',
          value: 'autumn-gallery',
          label: 'View Gallery',
        },
      },
    ],
  },
  {
    id: 'archive',
    name: 'Highlights',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&q=80',
    stories: [
      {
        id: 'arc-1',
        mediaType: 'image',
        mediaUrl:
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&q=80',
        timestamp: '1d',
        isSeen: true,
      },
    ],
  },
];

export default function App() {
  const [groups, setGroups] = useState<StoryGroup[]>(INITIAL_GROUPS);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handleStorySeen = useCallback((story: StoryItem, group: StoryGroup) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== group.id) return g;
        return {
          ...g,
          stories: g.stories.map((s) =>
            s.id === story.id ? { ...s, isSeen: true } : s,
          ),
        };
      }),
    );
  }, []);

  const handleCtaPress = useCallback((cta: StoryCtaData) => {
    Alert.alert(cta.label, `Target (${cta.type}): ${cta.value}`);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Stories</Text>
          <TouchableOpacity
            onPress={() => setGroups(INITIAL_GROUPS)}
            style={styles.resetButton}
          >
            <Text style={styles.resetLabel}>Reset Seen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trayCard}>
          <StoryAvatarList
            groups={groups}
            nameColor="#F9FAFB"
            seenNameColor="#9CA3AF"
            onGroupPress={(_, index) => {
              setActiveGroupIndex(index);
              setIsViewerVisible(true);
            }}
          />
        </View>

        <StoryViewer
          groups={groups}
          initialGroupIndex={activeGroupIndex}
          isVisible={isViewerVisible}
          onClose={() => setIsViewerVisible(false)}
          onStorySeen={handleStorySeen}
          onCtaPress={handleCtaPress}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  trayCard: {
    paddingVertical: 8,
  },
});
