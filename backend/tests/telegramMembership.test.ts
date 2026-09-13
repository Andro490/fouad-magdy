import test from 'node:test';
import assert from 'node:assert/strict';
import { getRequiredTelegramTargets, isValidTelegramMembershipStatus } from '../src/utils/telegram';

test('collects both channel and group requirements without duplicates', () => {
  assert.deepEqual(
    getRequiredTelegramTargets('@fouadmgdym', '@fouadmagdym24'),
    ['@fouadmgdym', '@fouadmagdym24']
  );

  assert.deepEqual(
    getRequiredTelegramTargets('@fouadmgdym', '@fouadmgdym'),
    ['@fouadmgdym']
  );
});

test('accepts valid Telegram membership statuses', () => {
  assert.equal(isValidTelegramMembershipStatus('member'), true);
  assert.equal(isValidTelegramMembershipStatus('administrator'), true);
  assert.equal(isValidTelegramMembershipStatus('creator'), true);
  assert.equal(isValidTelegramMembershipStatus('left'), false);
});
