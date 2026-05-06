/**
 * StoryMedia — Story Media Renderer
 *
 * Renders the background media of the story:
 * - `image` → full-screen display with expo-image
 * - `video` → with expo-video VideoView component
 *
 * Performance:
 * - expo-image already uses disk/memory cache
 * - Video `shouldPlay` and `isLooping` controls are managed via `isPaused` prop
 *
 * Synchronization:
 * - Progress bar doesn't start until `onMediaReady` callback is triggered
 * - Transitions to the next story when the video ends via `onVideoEnd` callback
 *
 * Error state:
 * - Shows a black background if media fails to load (graceful degradation)
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import type { StoryMediaProps } from '../types/story.types';


export function StoryMedia({
  mediaUrl,
  mediaType,
  posterUrl,
  isPaused = false,
  onMediaReady,
  onVideoEnd,
}: StoryMediaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when mediaUrl changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [mediaUrl]);

  if (hasError || !mediaUrl) {
    return <View style={[styles.media, styles.errorFallback]} />;
  }

  console.log(`[StoryMedia] Loaded Media URL (${mediaType}):`, mediaUrl);

  if (mediaType === 'video') {
    return (
      <VideoPlayer
        uri={mediaUrl}
        posterUrl={posterUrl}
        isPaused={isPaused}
        onReady={onMediaReady}
        onEnd={onVideoEnd}
        onError={() => setHasError(true)}
      />
    );
  }

  // Image rendering
  return (
    <View style={styles.media}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.7)" />
        </View>
      )}
      <Image
        source={{ uri: mediaUrl }}
        style={styles.media}
        contentFit="cover"
        transition={200}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          setIsLoading(false);
          onMediaReady?.();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

/**
 * Video player sub-component.
 * Uses expo-video (SDK 54+).
 *
 * Lifecycle:
 * 1. Player is created → video buffering starts
 * 2. When status is 'readyToPlay' → `onReady` is called (progress bar starts)
 * 3. When status is 'idle' (and was previously playing) → `onEnd` is called
 */
function VideoPlayer({
  uri,
  posterUrl,
  isPaused,
  onReady,
  onEnd,
  onError,
}: {
  uri: string;
  posterUrl?: string | null;
  isPaused: boolean;
  onReady?: () => void;
  onEnd?: () => void;
  onError: () => void;
}) {
  const readyFiredRef = useRef(false);

  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.muted = false;
    // Do not trigger playback — wait for readyToPlay callback
  });

  // Listen for status changes
  useEffect(() => {
    if (!player) return;

    // Reset ref for each new video
    readyFiredRef.current = false;

    // @ts-ignore: expo-video types might not expose addListener correctly
    const statusSub = player.addListener('statusChange', (event: any) => {
      if (event.error) {
        console.warn(`[StoryMedia] Video error (${uri}):`, event.error.message, event.error);
        onError();
        return;
      }

      if (event.status === 'readyToPlay' && !readyFiredRef.current) {
        readyFiredRef.current = true;
        onReady?.();
        if (!isPaused) {
          player.play();
        }
      }
    });

    // Triggered when video reaches the end
    // @ts-ignore
    const endSub = player.addListener('playToEnd', () => {
      onEnd?.();
    });

    return () => {
      statusSub.remove();
      endSub.remove();
    };
  }, [player, uri]);

  // Play/pause when isPaused prop changes
  useEffect(() => {
    if (!player || !readyFiredRef.current) return;
    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, player]);

  return (
    <VideoView
      style={styles.media}
      player={player}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  errorFallback: {
    backgroundColor: '#111111',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
