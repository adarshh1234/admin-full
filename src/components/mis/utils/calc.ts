export const sum = <T,>(arr: T[], key: keyof T): number =>
  arr.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export const avg = <T,>(arr: T[], key: keyof T): number =>
  arr.length ? sum(arr, key) / arr.length : 0;

export const fmt = (n: number): string => Math.round(n).toLocaleString('en-US');

export const fmtMoney = (n: number): string => '$' + fmt(n);

export const fmtFixed = (n: number, digits = 1): string =>
  Number.isFinite(n) ? n.toFixed(digits) : '0.0';

import type { Targets } from '../types';

export type ConditionalMode = 'normal' | 'inverse';

export function conditionalClass(
  field: string,
  value: number,
  targets: Targets,
  mode: ConditionalMode = 'normal'
): string {
  const target = field in targets ? targets[field as keyof Targets] : 0;
  if (!target) return '';
  if (mode === 'inverse') {
    if (value > target * 1.1) return 'mis-below-target';
    if (value <= target) return 'mis-above-target';
    return '';
  }
  if (value < target * 0.9) return 'mis-below-target';
  if (value >= target) return 'mis-above-target';
  return '';
}
