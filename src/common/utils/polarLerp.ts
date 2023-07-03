import { DEG2RAD, Vector2, map } from '@motion-canvas/core';
import { InterpolationFunction } from '@motion-canvas/core/lib/tweening';
import { PossibleVector2 } from '@motion-canvas/core/lib/types';

export function polarLerp(
  from: Vector2,
  to: Vector2,
  value: number,
  reverse = false,
  center: Vector2 = Vector2.zero,
): Vector2 {
  to = to.sub(center);
  from = from.sub(center);
  const toDegrees = reverse ? (to.degrees + 360) % 360 : to.degrees;
  const angle = map(from.degrees, toDegrees, value) * DEG2RAD;
  const magnitude = map(from.magnitude, to.magnitude, value);

  return new Vector2(
    magnitude * Math.cos(angle) + center.x,
    magnitude * Math.sin(angle) + center.y,
  );
}

export function createPolarLerp(
  reverse = false,
  center: PossibleVector2 = Vector2.zero,
): InterpolationFunction<Vector2> {
  return (from: Vector2, to: Vector2, value: number) =>
    polarLerp(from, to, value, reverse, new Vector2(center));
}
