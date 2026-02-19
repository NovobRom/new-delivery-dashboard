// Canonical status values (lowercase, trimmed) from Nova Post CSV
// Add new status variants here — all comparisons go through predicates below.

export const DELIVERED_STATUSES = new Set(['доставлено']);
export const UNDELIVERED_STATUSES = new Set(['не доставлено']);

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function isDelivered(status: string | undefined): boolean {
  return DELIVERED_STATUSES.has(normalize(status));
}

export function isUndelivered(status: string | undefined): boolean {
  return UNDELIVERED_STATUSES.has(normalize(status));
}
