import {
  Circle,
  Line,
  LineProps,
  Node,
  NodeProps,
  makeScene2D,
} from '@motion-canvas/2d';
import { Ray, Txt } from '@motion-canvas/2d/lib/components';
import {
  Vector2,
  createRef,
  easeInBack,
  easeOutBack,
  sequence,
  waitUntil,
} from '@motion-canvas/core';
import { all } from '@motion-canvas/core/lib/flow';
import { PossibleVector2 } from '@motion-canvas/core/lib/types';
import { makeRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { CircleObject, Vector } from '../components';

class Target extends Node {
  public readonly x1: Line;
  public readonly x2: Line;
  public readonly arrow: Ray;
  public readonly circle: Circle;
  public readonly text: Txt;

  public constructor(props: NodeProps) {
    super(props);

    this.add(
      <>
        <Line
          ref={makeRef(this, 'x1')}
          points={[
            [-20, -20],
            [20, 20],
          ]}
          lineWidth={5}
          stroke={theme.colors.White}
          end={0}
        />
        <Line
          ref={makeRef(this, 'x2')}
          points={[
            [20, -20],
            [-20, 20],
          ]}
          lineWidth={5}
          stroke={theme.colors.White}
          end={0}
        />

        <Vector
          ref={makeRef(this, 'arrow')}
          from={[50, 0]}
          to={[300, 0]}
          stroke={theme.colors.Gray2}
          end={0}
        />

        <Circle
          ref={makeRef(this, 'circle')}
          stroke={theme.colors.Red}
          lineWidth={5}
          size={60}
          lineDash={[12, 12]}
          position={[355, 0]}
          endAngle={0}
        />

        <Txt
          ref={makeRef(this, 'text')}
          text={'5m'}
          fill={theme.colors.White}
          fontFamily={theme.fonts.serif}
          fontSize={42}
          position={() =>
            this.arrow.getPointAtPercentage(0.5).position.add([0, -25])
          }
          scale={0}
        />
      </>,
    );
  }

  public *create() {
    yield* sequence(
      0.06,
      this.x1.end(1, 0.3),
      this.x2.end(1, 0.3),
      this.arrow.end(1, 0.5),
      this.circle.endAngle(360, 0.5),
      this.text.scale(1, 0.4),
    );
  }

  public *hide() {
    yield* sequence(
      0.06,
      this.text.scale(0, 0.4),
      this.circle.endAngle(0, 0.6),
      this.arrow.end(0, 0.6),
      this.x2.end(0, 0.5),
      this.x1.end(0, 0.5),
    );
  }
}

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();
  const arrow = createRef<Ray>();
  const distance = createRef<Txt>();
  const questionMark = createRef<Txt>();
  const targets: Target[] = [];

  const targetPositions: PossibleVector2[] = [
    [-700, -350],
    [-180, -30],
    [-500, 300],
    [400, -250],
    [360, 250],
  ];

  view.add(
    <>
      <Vector
        ref={arrow}
        from={() => circle().position().sub([300, 0])}
        to={() => circle().left().sub([15, 0])}
        stroke={theme.colors.Gray2}
        end={0}
      />

      <CircleObject ref={circle} scale={0} />

      <Txt
        ref={distance}
        text={'5m'}
        fill={theme.colors.White}
        fontFamily={theme.fonts.serif}
        fontSize={42}
        position={() =>
          arrow().getPointAtPercentage(0.5).position.add([0, -25])
        }
        scale={0}
      />

      <Txt
        ref={questionMark}
        text={'?'}
        fill={theme.colors.White}
        fontFamily={theme.fonts.serif}
        fontSize={72}
        position={() => arrow().from().sub([30, 0])}
        scale={0}
      />

      {targetPositions.map((pos, i) => (
        <Target ref={makeRef(targets, i)} position={pos} />
      ))}
    </>,
  );

  yield* waitUntil('show circle');
  yield* circle().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show arrow');
  yield* sequence(0.1, arrow().end(1, 0.7), distance().scale(1, 0.6));

  yield* waitUntil('show question mark');
  yield* questionMark().scale(1, 0.7);

  yield* waitUntil('hide circle');
  yield* sequence(
    0.1,
    circle().scale(0, 0.5, easeInBack),
    questionMark().scale(0, 0.5, easeInBack),
    distance().scale(0, 0.5, easeInBack),
    arrow().end(0, 0.5, easeInBack),
  );

  yield* waitUntil('show targets');
  yield* sequence(0.07, ...targets.map((target) => target.create()));

  yield* waitUntil('hide targets');
  yield* sequence(0.1, ...targets.map((target) => target.hide()));

  yield* waitUntil('scene end');
});
