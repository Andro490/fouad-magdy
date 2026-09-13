export type CoachLike = {
  id?: string | number | null;
  [key: string]: any;
};

export const normalizeCoachId = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const removeCoachById = (coaches: CoachLike[], rawId: string | number | null | undefined) => {
  const targetId = normalizeCoachId(rawId);

  if (!targetId) {
    return coaches;
  }

  const filtered = coaches.filter((coach) => normalizeCoachId(coach.id) !== targetId);
  return filtered.length === coaches.length ? coaches : filtered;
};
