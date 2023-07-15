import { Latex } from '@motion-canvas/2d';
import { Layout } from '@motion-canvas/2d/lib/components';
import { Reference } from '@motion-canvas/core';
import { all, sequence } from '@motion-canvas/core/lib/flow';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';

import { wrapArray } from '@common/utils';

export function swapNodes(
  a: (Layout | Reference<Layout>)[] | Layout | Reference<Layout>,
  b: (Layout | Reference<Layout>)[] | Layout | Reference<Layout>,
): ThreadGenerator {
  const fromMatrices = wrapArray(a).map((m) => (m instanceof Layout ? m : m()));
  const toMatrices = wrapArray(b).map((m) => (m instanceof Layout ? m : m()));

  return sequence(
    0.5,
    all(...fromMatrices.map((m) => m.scale(0, 0.6, easeInBack))),
    all(...toMatrices.map((m) => m.scale(1, 0.6, easeOutBack))),
  );
}
