/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from "../types";

/**
 * Calculates the Euclidean distance between two points.
 */
export const distance = (a: Vector2D, b: Vector2D): number => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

/**
 * Simple linear interpolation between two values.
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

/**
 * Clamps a value between a minimum and maximum range.
 */
export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, val));
};
