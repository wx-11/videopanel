import test from 'node:test';
import assert from 'node:assert/strict';

import { detectUpstreamStreamFailure } from '../src/streamErrors.js';

test('detects OpenAI-style invalid_request stream text', () => {
  const text = `HTTP Error: 400 { "error": { "message": "Hmmm something didn't look right with your request. Please try again later or visit https://help.openai.com if this issue persists.", "type": "invalid_request_error", "param": null, "code": "invalid_request" } }`;
  assert.ok(detectUpstreamStreamFailure(text));
});

test('does not flag normal progress logs', () => {
  assert.equal(detectUpstreamStreamFailure('Video Generation Progress: 12%'), null);
});
