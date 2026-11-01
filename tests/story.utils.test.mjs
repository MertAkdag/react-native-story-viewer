import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  isStoryGroupSeen,
  resolveInitialStoryIndex,
  resolveStoryDurationMs,
  getPrefetchUrls,
} = require('../lib/commonjs/utils/story.utils.js');

const sampleGroups = [
  {
    id: 'g1',
    name: 'Armillis',
    avatarUrl: 'https://cdn.example.com/a1.jpg',
    stories: [
      { id: 's1', mediaType: 'image', mediaUrl: 'https://cdn.example.com/s1.jpg', isSeen: true },
      { id: 's2', mediaType: 'image', mediaUrl: 'https://cdn.example.com/s2.jpg', isSeen: false },
      { id: 's3', mediaType: 'video', mediaUrl: 'https://cdn.example.com/s3.mp4', posterUrl: 'https://cdn.example.com/s3-poster.jpg', isSeen: false },
    ],
  },
  {
    id: 'g2',
    name: 'Studio',
    avatarUrl: 'https://cdn.example.com/a2.jpg',
    stories: [
      { id: 's4', mediaType: 'image', mediaUrl: 'https://cdn.example.com/s4.jpg', isSeen: true },
      { id: 's5', mediaType: 'image', mediaUrl: 'https://cdn.example.com/s5.jpg', isSeen: true },
    ],
  },
];

test('isStoryGroupSeen detects unseen and fully-seen story groups', () => {
  assert.equal(isStoryGroupSeen(sampleGroups[0]), false);
  assert.equal(isStoryGroupSeen(sampleGroups[1]), true);
  assert.equal(
    isStoryGroupSeen({ id: 'empty', name: 'Empty', avatarUrl: '', isSeen: true, stories: [] }),
    true,
  );
});

test('resolveInitialStoryIndex jumps to first unseen story or clamps explicit index', () => {
  assert.equal(resolveInitialStoryIndex(sampleGroups[0]), 1);
  assert.equal(resolveInitialStoryIndex(sampleGroups[0], undefined, false), 0);
  assert.equal(resolveInitialStoryIndex(sampleGroups[0], 2), 2);
  assert.equal(resolveInitialStoryIndex(sampleGroups[0], 99), 2);
  assert.equal(resolveInitialStoryIndex(sampleGroups[1]), 0);
});

test('resolveStoryDurationMs prioritizes explicit duration, then detected video duration, then default', () => {
  assert.equal(
    resolveStoryDurationMs({ id: '1', mediaType: 'video', mediaUrl: 'x.mp4', durationMs: 8000 }, 14000, 5000),
    8000,
  );
  assert.equal(
    resolveStoryDurationMs({ id: '2', mediaType: 'video', mediaUrl: 'x.mp4' }, 14200, 5000),
    14200,
  );
  assert.equal(
    resolveStoryDurationMs({ id: '3', mediaType: 'image', mediaUrl: 'x.jpg' }, 14200, 5000),
    5000,
  );
});

test('getPrefetchUrls gathers next story image/poster and next group entry media', () => {
  const urls = getPrefetchUrls(sampleGroups, 0, 1, true);
  assert.deepEqual(urls, [
    'https://cdn.example.com/s3-poster.jpg',
    'https://cdn.example.com/a2.jpg',
    'https://cdn.example.com/s4.jpg',
  ]);
});
