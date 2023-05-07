import { makeScene2D } from '@motion-canvas/2d';
import {
  Circle,
  Layout,
  Line,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  all,
  chain,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createComputed, createSignal } from '@motion-canvas/core/lib/signals';
import { easeOutBack, easeOutCubic } from '@motion-canvas/core/lib/tweening';
import { BBox, Origin } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import {
  CircleObject,
  Control,
  Coordinates,
  Cursor,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  TransformationRig,
  Vector,
} from '../components';

export default makeScene2D(function* (view) {
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const rectPos = createRef<Coordinates>();
  const rectScaleCoordinates = createRef<Coordinates>();
  const rectScale = createRef<Layout>();
  const scaleFormulaGroup = createRef<Node>();
  const circle = createRef<Circle>();
  const circleRelativePos = createRef<Coordinates>();
  const circleAbsolutePos = createRef<Coordinates>();
  const objectGroup = createRef<Node>();
  const localVector = createRef<Line>();
  const rig = createRef<TransformationRig>();
  const cursor = createRef<Cursor>();

  const rectCoordinatesOffset = createSignal(30);

  yield view.add(
    <>
      <SceneContainer ref={scene} scale={0} showAxis>
        <RectCircleSceneTree position={[-370, -305]} />

        <Node ref={objectGroup} position={[-200, 150]}>
          <RectObject ref={rect} scale={0} />

          <CircleObject
            ref={circle}
            position={() => rect().position().add([300, -200])}
            scale={0}
          />
        </Node>

        <Coordinates
          ref={rectPos}
          coordinates={() =>
            rect().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          position={() => {
            const offset =
              BBox.fromPoints(
                ...rect()
                  .cacheBBox()
                  .transformCorners(
                    rect().localToWorld().multiply(scene().worldToLocal()),
                  ),
              ).height / 2;

            return rect()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
              .add([0, offset + rectCoordinatesOffset()]);
          }}
          scale={0}
          zIndex={1}
        />

        <Layout
          ref={rectScale}
          position={() => rectPos().position().add([0, 46])}
          alignItems={'center'}
          gap={8}
          scale={0}
          layout
        >
          <Txt
            text={'Scale'}
            fontSize={28}
            fontFamily={theme.fonts.mono}
            fontWeight={400}
            fill={theme.colors.Gray1}
          />

          <Coordinates
            ref={rectScaleCoordinates}
            coordinates={() => rect().scale()}
            decimals={2}
            xColor={theme.colors.White}
            yColor={theme.colors.White}
            zIndex={1}
          />
        </Layout>

        <Coordinates
          ref={circleAbsolutePos}
          scale={0}
          coordinates={() =>
            circle().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          position={() =>
            circle()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
              .add([0, -60])
          }
        />

        <Layout
          position={() =>
            localVector().getPointAtPercentage(0.4).position.add([280, 0])
          }
          gap={12}
          layout
        >
          <Coordinates
            ref={circleRelativePos}
            coordinates={() => circle().position().mul(objectGroup().scale())}
            xColor={theme.colors.White}
            yColor={theme.colors.White}
            scale={0}
          />

          <Layout
            ref={scaleFormulaGroup}
            fontFamily={theme.fonts.mono}
            gap={12}
            scale={0}
          >
            <Txt
              text={'* Scale = '}
              fill={theme.colors.Gray1}
              fontSize={28}
              fontWeight={400}
            />
            <Coordinates
              coordinates={() => circle().position().mul(objectGroup().scale())}
              xColor={theme.colors.White}
              yColor={theme.colors.White}
            />
          </Layout>
        </Layout>

        <Vector
          ref={localVector}
          from={() =>
            rect().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          to={() =>
            circle().absolutePosition().transformAsPoint(scene().worldToLocal())
          }
          end={0}
        />

        <TransformationRig
          scale={0}
          ref={rig}
          node={rect()}
          lineWidth={1}
          stroke={theme.colors.White}
          fill={theme.colors.Gray5}
          spacing={20}
        />
      </SceneContainer>

      <Cursor ref={cursor} scale={0} position={[150, 100]} />
    </>,
  );

  yield* waitUntil('show scene');
  yield* sequence(
    0.5,
    scene().scale(1, 0.8, easeOutBack),
    sequence(
      0.1,
      rect().scale(1, 0.7, easeOutBack),
      circle().scale(1, 0.7, easeOutBack),
      rectPos().show(),
      circleAbsolutePos().show(),
    ),
  );

  yield* waitUntil('show rig');
  yield* all(
    rectScale().scale(1, 0.6, easeOutBack),
    rig().scale(1, 0.8, easeOutBack),
    cursor().show(),
    rectCoordinatesOffset(50, 0.6, easeOutCubic),
  );

  yield* waitUntil('scale rect');
  let cursorPos = createComputed(() =>
    rig().control(Control.TopRight).transformAsPoint(rig().localToWorld()),
  );
  yield* cursor().moveToPosition(cursorPos(), 0.7);
  cursor().stickTo(cursorPos);
  yield* rect().scale(2, 1).to(0.8, 1).to(1, 1);

  const scaleGroup = () =>
    chain(
      objectGroup().scale(1.35, 1),
      waitFor(0.2),
      objectGroup().scale(0.7, 1),
      waitFor(0.2),
      objectGroup().scale(1, 1),
    );
  yield* waitUntil('show desired scaling');
  rectScaleCoordinates().coordinates(objectGroup().scale);
  yield* scaleGroup();

  yield* waitUntil('scale group');
  yield* scaleGroup();
  cursor().unstick();

  yield* waitUntil('hide cursor');
  yield* cursor().hide();

  yield* waitUntil('show local vec');
  yield* sequence(0.4, localVector().end(1, 0.8), circleRelativePos().show());

  yield* waitUntil('show cursor');
  yield* cursor().show();
  cursor().stickTo(cursorPos);

  yield* waitUntil('scale group 2');
  yield* scaleGroup();

  yield* waitUntil('multiply scale');
  circleRelativePos().coordinates([300, -200]);
  yield* scaleFormulaGroup().scale(1, 0.6, easeOutBack);

  yield* waitUntil('scale group 3');
  yield* scaleGroup();
  cursor().unstick();

  yield* waitUntil('scene end');
});
