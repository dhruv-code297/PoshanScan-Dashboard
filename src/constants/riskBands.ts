export const RISK_BANDS = {
  NORMAL: {
    id: 'Normal',
    label: 'Normal (≥125mm)',
    shortLabel: 'Normal',
    color: '#2F8F5B', // color-normal
    bgClass: 'bg-[var(--color-normal)]',
    textClass: 'text-[var(--color-normal)]',
  },
  MAM: {
    id: 'MAM',
    label: 'MAM (115-124mm)',
    shortLabel: 'MAM',
    color: '#D99A2B', // color-mam
    bgClass: 'bg-[var(--color-mam)]',
    textClass: 'text-[var(--color-mam)]',
  },
  SAM: {
    id: 'SAM',
    label: 'SAM (<115mm)',
    shortLabel: 'SAM',
    color: '#C24444', // color-sam
    bgClass: 'bg-[var(--color-sam)]',
    textClass: 'text-[var(--color-sam)]',
  },
} as const;

export type RiskBandType = keyof typeof RISK_BANDS;
