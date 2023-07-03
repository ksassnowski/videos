import { Node } from '@motion-canvas/2d';
import { Vector2 } from '@motion-canvas/core';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import {
  TimingFunction,
  easeInOutCubic,
} from '@motion-canvas/core/lib/tweening';
import { Matrix2D, PossibleVector2 } from '@motion-canvas/core/lib/types';

import { createPolarLerp } from '@common/utils/polarLerp';

/**
 * Rotates a point around another point by the provided angle (in degrees).
 *
 * @param point - The point to rotate.
 * @param angle - The angle by which to rotate.
 * @param center - The center of rotation.
 */
export function rotatePoint(
  point: PossibleVector2,
  angle: number,
  center: PossibleVector2 = Vector2.zero,
): Vector2 {
  const originVector = new Vector2(center);
  const matrix = Matrix2D.fromTranslation(originVector)
    .mul(Matrix2D.fromRotation(angle))
    .mul(Matrix2D.fromTranslation(originVector.flipped));
  return new Vector2(point).transformAsPoint(matrix.domMatrix);
}

export function rotatePosition(
  node: Node,
  angle: number,
  duration: number,
  timingFunction: TimingFunction = easeInOutCubic,
  reverse = false,
  center: PossibleVector2 = Vector2.zero,
): ThreadGenerator {
  return node.position(
    rotatePoint(node.position(), angle, center),
    duration,
    timingFunction,
    createPolarLerp(reverse, center),
  );
}
