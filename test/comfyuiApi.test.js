import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ensureComfyuiV1BaseUrl,
  comfyuiProgressPercent,
  pickComfyuiVideoUrl,
  parseComfyuiModelsList,
  parseOpenAiLikeErrorMessage,
} from '../src/comfyuiApi.js';

test('ensureComfyuiV1BaseUrl appends /v1 when needed', () => {
  assert.equal(ensureComfyuiV1BaseUrl('http://127.0.0.1:8000'), 'http://127.0.0.1:8000/v1');
  assert.equal(ensureComfyuiV1BaseUrl('http://127.0.0.1:8000/'), 'http://127.0.0.1:8000/v1');
  assert.equal(ensureComfyuiV1BaseUrl('http://127.0.0.1:8000/v1'), 'http://127.0.0.1:8000/v1');
  assert.equal(ensureComfyuiV1BaseUrl('/comfy'), '/comfy/v1');
});

test('comfyuiProgressPercent matches server clamp behavior', () => {
  assert.equal(comfyuiProgressPercent({ value: 0, max: 0 }), 0);
  assert.equal(comfyuiProgressPercent({ value: 1, max: 2 }), 50);
  assert.equal(comfyuiProgressPercent({ value: 99, max: 100 }), 99);
  assert.equal(comfyuiProgressPercent({ value: 100, max: 100 }), 99);
  assert.equal(comfyuiProgressPercent({ value: 100, max: 100 }, { completed: true }), 100);
});

test('pickComfyuiVideoUrl prefers job.url then video outputs', () => {
  assert.equal(pickComfyuiVideoUrl({ url: 'http://x/video.mp4', outputs: [] }), 'http://x/video.mp4');
  assert.equal(
    pickComfyuiVideoUrl({ outputs: [{ filename: 'a.png', url: 'http://x/a.png' }, { filename: 'b.mp4', url: 'http://x/b.mp4' }] }),
    'http://x/b.mp4',
  );
});

test('parseOpenAiLikeErrorMessage extracts error.message', () => {
  const json = { error: { message: 'bad request', type: 'invalid_request_error' } };
  assert.equal(parseOpenAiLikeErrorMessage(json), 'bad request');
  assert.equal(parseOpenAiLikeErrorMessage(JSON.stringify(json)), 'bad request');
});

test('parseComfyuiModelsList extracts OpenAI-like models list', () => {
  const payload = {
    object: 'list',
    data: [
      { id: 'txt2video.json', object: 'model', metadata: { kind: 'txt2video' } },
      { id: 'img2video.json', object: 'model', metadata: { kind: 'img2video' } },
      { id: '', object: 'model', metadata: { kind: 'txt2video' } },
    ],
  };
  assert.deepEqual(parseComfyuiModelsList(payload), [
    { id: 'txt2video.json', kind: 'txt2video' },
    { id: 'img2video.json', kind: 'img2video' },
  ]);
});
