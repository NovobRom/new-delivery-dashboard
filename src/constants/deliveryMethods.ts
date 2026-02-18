// Canonical display names returned by normalizeMethodName().
export const METHOD_NAMES = {
    HAND_DELIVERY: 'Hand Delivery',
    POST_OFFICE: 'Post Office',
    SAFE_PLACE: 'Safe Place',
    UNKNOWN: 'Unknown',
} as const;

// Keywords for identifying delivery method categories (case-insensitive substring match).
// Extend these arrays when new method names appear in CSV data.

export const HAND_DELIVERY_KEYWORDS = ['hand', 'руки', 'в руки'];
export const SAFE_PLACE_METHOD_KEYWORDS = ['safe', 'безпечн'];
export const SAFE_PLACE_COL_VALUES = new Set(['yes', '1', 'true']);

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function isHandDelivery(method: string | undefined): boolean {
  const m = norm(method);
  return HAND_DELIVERY_KEYWORDS.some((kw) => m.includes(kw));
}

export function isSafePlaceMethod(method: string | undefined): boolean {
  const m = norm(method);
  return SAFE_PLACE_METHOD_KEYWORDS.some((kw) => m.includes(kw));
}

export function isSafePlaceColumn(safePlaceVal: string | undefined): boolean {
  return SAFE_PLACE_COL_VALUES.has(norm(safePlaceVal));
}

export function isSafePlace(
  method: string | undefined,
  safePlaceCol: string | undefined,
): boolean {
  return isSafePlaceMethod(method) || isSafePlaceColumn(safePlaceCol);
}

/** Normalize delivery method name for chart display */
export function normalizeMethodName(method: string | undefined, safePlaceCol: string | undefined): string {
  const m = norm(method);

  if (m.includes('hand') || m.includes('руки') || m.includes('в руки')) return METHOD_NAMES.HAND_DELIVERY;
  if (m.includes('post')) return METHOD_NAMES.POST_OFFICE;
  if (m.includes('safe') || m.includes('безпечн')) return METHOD_NAMES.SAFE_PLACE;

  if (isSafePlaceColumn(safePlaceCol)) return METHOD_NAMES.SAFE_PLACE;

  return method || METHOD_NAMES.UNKNOWN;
}
