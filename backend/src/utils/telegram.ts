export const isValidTelegramMembershipStatus = (status?: string) => {
  if (!status) return false;
  return ['member', 'administrator', 'creator'].includes(status);
};

export const normalizeTelegramTarget = (target?: string) => {
  if (!target) return '';
  const trimmed = String(target).trim();
  if (!trimmed) return '';
  // A private user ID (positive integer) is for notifications, not a channel/group to join
  if (/^\d+$/.test(trimmed)) return '';
  if (/^-\d+$/.test(trimmed)) return trimmed;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
};

export const getRequiredTelegramTargets = (channel?: string, group?: string) => {
  const targets = [normalizeTelegramTarget(channel), normalizeTelegramTarget(group)];
  return [...new Set(targets.filter(Boolean))];
};
