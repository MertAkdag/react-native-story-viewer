import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import type { StoryMediaProps, StoryMediaReadyMeta } from '../types/story.types';

export function StoryMedia({
  mediaUrl,
  mediaType,
  posterUrl,
  isPaused = false,
  isMuted = false,
  onMediaReady,
  onVideoEnd,
}: StoryMediaProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const readyFiredRef = useRef(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    readyFiredRef.current = false;
  }, [mediaUrl, mediaType]);

  if (hasError || !mediaUrl) {
    return <View style={[styles.media, styles.errorFallback]} />;
  }

  if (mediaType === 'video') {
    return (
      <VideoPlayer
        uri={mediaUrl}
        posterUrl={posterUrl}
        isPaused={isPaused}
        isMuted={isMuted}
        onReady={onMediaReady}
        onEnd={onVideoEnd}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <View style={styles.media}>
      {isLoading && (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.75)" />
        </View>
      )}
      <Image
        source={{ uri: mediaUrl }}
        style={styles.media}
        contentFit="cover"
        transition={180}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
          if (!readyFiredRef.current) {
            readyFiredRef.current = true;
            onMediaReady?.();
          }
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

function VideoPlayer({
  uri,
  posterUrl,
  isPaused,
  isMuted,
  onReady,
  onEnd,
  onError,
}: {
  uri: string;
  posterUrl?: string | null;
  isPaused: boolean;
  isMuted: boolean;
  onReady?: (meta?: StoryMediaReadyMeta) => void;
  onEnd?: () => void;
  onError: () => void;
}) {
  const [isReady, setIsReady] = useState(false);
  const readyFiredRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
    instance.muted = isMuted;
  });

  useEffect(() => {
    setIsReady(false);
    readyFiredRef.current = false;
  }, [uri]);

  useEffect(() => {
    if (!player) return;

    readyFiredRef.current = false;

    const statusSub = (player as any).addListener('statusChange', (event: any) => {
      if (event?.error) {
        onErrorRef.current();
        return;
      }

      if (event?.status === 'readyToPlay' && !readyFiredRef.current) {
        readyFiredRef.current = true;
        setIsReady(true);

        const rawSeconds = typeof (player as any).duration === 'number'
          ? (player as any).duration
          : 0;
        const durationMs =
          rawSeconds > 0 && Number.isFinite(rawSeconds)
            ? Math.round(rawSeconds * 1000)
            : undefined;

        onReadyRef.current?.({ durationMs });

        if (!isPausedRef.current) {
          player.play();
        }
      }
    });

    const endSub = (player as any).addListener('playToEnd', () => {
      onEndRef.current?.();
    });

    return () => {
      statusSub?.remove?.();
      endSub?.remove?.();
    };
  }, [player, uri]);

  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!player || !readyFiredRef.current) return;
    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, player]);

  return (
    <View style={styles.media}>
      <VideoView
        style={styles.media}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />
      {!isReady && (
        <View style={styles.posterOverlay} pointerEvents="none">
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={styles.media}
              contentFit="cover"
            />
          ) : null}
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.8)" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  errorFallback: {
    backgroundColor: '#111111',
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
