/** Centralised TanStack Query keys — keeps cache invalidation predictable. */
export const queryKeys = {
  health: ['health'] as const,
  me: ['me'] as const,
};
