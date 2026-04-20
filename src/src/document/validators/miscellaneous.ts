import { EPSILON } from "../../miscellaneous/math";

export function isValidNumber(value: number): boolean {
  return !isNaN(value) && value !== Infinity && value !== -Infinity;
}

export function isValidPositiveNumber(value: number): boolean {
  return isValidNumber(value) && value >= EPSILON;
}

export function isValidNonNegativeNumber(value: number): boolean {
  return isValidNumber(value) && value >= 0;
}

export function isValidNonZeroNumber(value: number): boolean {
  return isValidNumber(value) && value >= EPSILON && value <= -EPSILON;
}

export function isValidName(value: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
}

export function isValidNormalizedNumber(value: number): boolean {
  return isValidNumber(value) && value >= 0 && value <= 1;
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
