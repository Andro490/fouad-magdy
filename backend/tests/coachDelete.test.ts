import { test } from 'node:test';
import assert from 'node:assert/strict';

import { removeCoachById } from '../src/utils/coachDelete';

test('delete removes a coach even when ids are stored as numbers and the request uses a string', () => {
  const coaches = [
    { id: 17609097478250, name: 'Antonio Conte' },
    { id: 17608292273375, name: 'Frank Lampard' }
  ];

  const result = removeCoachById(coaches, ' 17608292273375 ');

  assert.deepEqual(result, [{ id: 17609097478250, name: 'Antonio Conte' }]);
});

test('delete returns original list when coach id is missing', () => {
  const coaches = [
    { id: 17609097478250, name: 'Antonio Conte' }
  ];

  const result = removeCoachById(coaches, '999');

  assert.deepEqual(result, coaches);
});
