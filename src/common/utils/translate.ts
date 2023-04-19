import { Node } from '@motion-canvas/2d/lib/components';
import { SignalGenerator } from '@motion-canvas/core/lib/signals';
import {
  InterpolationFunction,
  TimingFunction,
  easeInOutCubic,
} from '@motion-canvas/core/lib/tweening';
import { PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';

/**
 * Translate the provided node by the given vector relative to its current
 * position.
 *
 * @param node - The node to translate
 * @param by - The vector by which to translate the node
 * @param duration - The duration of the transition
 * @param timingFunction - The timing function used for the transition
 * @param interpolationFunction - The interpolation function used for the
 *                                transition.
 */
export function translate(
  node: Node,
  by: PossibleVector2,
  duration: number,
  timingFunction: TimingFunction = easeInOutCubic,
  interpolationFunction: InterpolationFunction<Vector2> = Vector2.lerp,
): SignalGenerator<PossibleVector2, Vector2> {
  return node.position(
    node.position().add(new Vector2(by)),
    duration,
    timingFunction,
    interpolationFunction,
  );
}
