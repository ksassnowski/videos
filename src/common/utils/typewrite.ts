import { Txt } from '@motion-canvas/2d/lib/components';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { TimingFunction, linear } from '@motion-canvas/core/lib/tweening';

/**
 * Reveal text one character at a time.
 *
 * @param node - The text node to animate.
 * @param duration - The duration of the animation.
 * @param timingFunction - The timing function to use for the transition.
 */
export function* typewrite(
  node: Txt,
  duration: number,
  timingFunction: TimingFunction = linear,
): ThreadGenerator {
  const t = createSignal(0);
  const width = node.cacheBBox().width;
  const text = node.text();

  node.width(width);
  node.text(() => text.slice(0, t()));
  yield* t(text.length, duration, timingFunction);
}
