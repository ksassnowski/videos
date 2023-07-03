import { makeScene2D } from '@motion-canvas/2d';
import {
  Latex,
  Layout,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import { all, sequence, waitUntil } from '@motion-canvas/core/lib/flow';
import { cancel } from '@motion-canvas/core/lib/threading';
import { slideTransition } from '@motion-canvas/core/lib/transitions';
import {
  easeInBack,
  easeOutBack,
  linear,
} from '@motion-canvas/core/lib/tweening';
import { Direction } from '@motion-canvas/core/lib/types';
import { createRef, range } from '@motion-canvas/core/lib/utils';

import { texColor } from '@common/utils';

import theme from '@theme';

import {
  AnimatedSprite,
  Hero,
  finalFormulaSeparateTex,
  localToParentFormula,
} from '../components';

export default makeScene2D(function* (view) {
  const formulaSeparate = createRef<Latex>();
  const highlightRect = createRef<Rect>();
  const formulaCombined = createRef<Latex>();
  const hero = createRef<AnimatedSprite>();
  const questionMarks = createRef<Node>();

  yield view.add(
    <>
      <Rect
        ref={highlightRect}
        fill={`${theme.colors.Green1}44`}
        lineWidth={4}
        stroke={theme.colors.Green1}
        radius={14}
        size={[60, 80]}
        position={[-518, -2]}
        scale={0}
        smoothCorners
      />

      <Latex
        ref={formulaSeparate}
        tex={texColor(finalFormulaSeparateTex, theme.colors.White)}
        height={180}
      />

      <Latex
        ref={formulaCombined}
        tex={texColor(localToParentFormula, theme.colors.White)}
        height={250}
        scale={0}
      />

      <Node>
        <Node
          ref={questionMarks}
          position={() => hero().position().add([0, -130])}
        >
          {range(3).map((i) => (
            <Txt
              fontFamily={theme.fonts.pixel}
              fill={theme.colors.White}
              fontSize={110}
              text={'?'}
              rotation={-40 + 40 * i}
              x={-90 + 90 * i}
              y={i !== 1 ? 40 : 0}
              scale={0}
            />
          ))}
        </Node>
        <Hero ref={hero} scale={8} position={[-1100, 470]} />
      </Node>
    </>,
  );

  yield* slideTransition(Direction.Top, 1);

  yield* waitUntil('highlight theta');
  yield* highlightRect().scale(1, 0.7, easeOutBack);

  yield* waitUntil('highlight formula');
  yield* all(
    highlightRect().size([900, 220], 0.8),
    highlightRect().position.x(14, 0.8),
  );

  yield* waitUntil('hide highlight');
  yield* highlightRect().scale(0, 0.6, easeInBack);

  yield* waitUntil('show formula combined');
  yield* sequence(
    0.4,
    formulaSeparate().scale(0, 0.6, easeInBack),
    formulaCombined().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('enter hero');
  let heroAnimation = yield hero().loop('walk');
  yield* hero().position.x(-700, 1.5, linear);
  cancel(heroAnimation);
  heroAnimation = yield hero().loop('idle');

  yield* waitUntil('show question marks');
  yield* sequence(
    0.1,
    ...questionMarks()
      .children()
      .map((node) => node.scale(1, 0.6, easeOutBack)),
  );

  yield* waitUntil('hide question marks');
  yield* sequence(
    0.1,
    ...questionMarks()
      .children()
      .map((node) => node.scale(0, 0.6, easeInBack)),
  );

  yield* waitUntil('exit hero');
  cancel(heroAnimation);
  hero().scale([-8, 8]);
  heroAnimation = yield hero().loop('walk');
  yield* hero().position.x(-1100, 1.5, linear);
  cancel(heroAnimation);

  yield* waitUntil('scene end');
});
