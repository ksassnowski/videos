import { SurroundingRectangle } from '@ksassnowski/motion-canvas-components';

import {
  Circle,
  Latex,
  Layout,
  LayoutProps,
  Node,
  Polygon,
  Ray,
  Rect,
  Txt,
  makeScene2D,
} from '@motion-canvas/2d';
import {
  DEFAULT,
  Direction,
  PossibleColor,
  ThreadGenerator,
  Vector2,
  all,
  chain,
  createRef,
  delay,
  easeInBack,
  easeInOutCubic,
  easeOutBack,
  loop,
  sequence,
  slideTransition,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';

import {
  createPolarLerp,
  rotatePoint,
  texColor,
  translate,
  typewrite,
} from '@common/utils';

import theme from '@theme';

import {
  CircleObject,
  Coordinates,
  Grid,
  RectCircleSceneTree,
  RectObject,
  SceneContainer,
  SceneTree,
  Vector,
  localToParentTex,
  rotationMatrixTex,
  scalingMatrixTex,
  translationMatrixTex,
} from '../components';
import { swapNodes } from '../utils';

export default makeScene2D(function* (view) {
  const localToParentMatrix = createRef<Latex>();
  const matrixLabel = createRef<Txt>();
  const matrixContainer = createRef<Layout>();
  const scene = createRef<SceneContainer>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();
  const circleGrid = createRef<Grid>();
  const rectGrid = createRef<Grid>();
  const localPositionVector = createRef<Ray>();
  const localPosCoordinates = createRef<Coordinates>();
  const parentPositionVector = createRef<Ray>();
  const parentPosCoordinates = createRef<Coordinates>();
  const highlightRect = createRef<SurroundingRectangle>();
  const scalingMatrix = createRef<Layout>();
  const rotationMatrix = createRef<Layout>();
  const translationMatrix = createRef<Layout>();
  const polygon = createRef<Polygon>();
  const polygonLocalPositionVector = createRef<Ray>();
  const polygonLocalCoordinates = createRef<Coordinates>();
  const polygonParentPositionVector = createRef<Ray>();
  const polygonParentPosCoordinates = createRef<Coordinates>();
  const polygonWorldPositionVector = createRef<Ray>();
  const polygonWorldPosCoordinates = createRef<Coordinates>();
  const polygonLocalToWorld = createRef<Layout>();
  const circleLocalToWorld = createRef<Layout>();
  const rectLocalToWorld = createRef<Layout>();
  const matrixNameContainer = createRef<Layout>();

  const sceneTree = (<RectCircleSceneTree />) as SceneTree;

  function MatrixName({
    icon,
    text,
    color = theme.colors.White,
    ...rest
  }: LayoutProps & { icon?: Node; text: string; color?: PossibleColor }) {
    return (
      <Layout
        fontSize={42}
        fontFamily={theme.fonts.mono}
        alignItems={'center'}
        gap={16}
        layout
        {...rest}
      >
        {icon}
        <Txt text={text} fill={color} />
      </Layout>
    );
  }

  function CircleIcon() {
    return (
      <Circle
        size={30}
        fill={theme.colors.Red}
        lineWidth={8}
        stroke={`${theme.colors.Red}88`}
      />
    );
  }

  function RectIcon() {
    return (
      <Rect
        size={30}
        fill={theme.colors.Blue1}
        lineWidth={8}
        stroke={`${theme.colors.Blue1}88`}
        radius={8}
        smoothCorners
      />
    );
  }

  function showParentSpace() {
    return sequence(
      0.7,
      all(
        scene().labelText('', 0.5).wait(0.1).to('Parent Space', 0.5),
        delay(0.6, scene().labelColor(theme.colors.Brown2, 0)),
        rectGrid().opacity(0.3, 0.7),
      ),
      all(
        scene().gridStroke('#524539', 0.6),
        scene().axisStroke('#7e6143', 0.6),
      ),
    );
  }

  function showLocalSpace(extraAnimations: ThreadGenerator[] = []) {
    return sequence(
      0.6,
      all(
        scene().labelText('', 0.5).wait(0.1).to('Local Space', 0.5),
        delay(0.6, scene().labelColor(theme.colors.Blue1, 0)),
        scene().gridStroke(DEFAULT, 0.5),
        scene().axisStroke(DEFAULT, 0.5),
        ...extraAnimations,
      ),
      rectGrid().opacity(1, 0.7),
    );
  }

  yield view.add(
    <>
      <Txt
        ref={matrixLabel}
        fontFamily={theme.fonts.mono}
        text={''}
        fill={theme.colors.Green1}
        fontSize={72}
        y={-300}
      />

      <Latex
        ref={localToParentMatrix}
        tex={texColor(localToParentTex, theme.colors.White)}
        height={280}
      />

      <Layout
        ref={matrixContainer}
        alignItems={'center'}
        y={-390}
        scale={0}
        layout
      >
        <Latex
          ref={translationMatrix}
          tex={texColor(translationMatrixTex, theme.colors.White)}
          height={200}
        />
        <Latex
          ref={rotationMatrix}
          tex={texColor(rotationMatrixTex, theme.colors.White)}
          height={200}
        />
        <Latex
          ref={scalingMatrix}
          tex={texColor(scalingMatrixTex, theme.colors.White)}
          height={200}
        />
      </Layout>

      <Layout
        ref={matrixNameContainer}
        direction={'column'}
        y={-380}
        gap={32}
        layout
      >
        <Layout
          ref={polygonLocalToWorld}
          alignItems={'center'}
          gap={32}
          scale={0}
        >
          <MatrixName
            icon={
              <Polygon
                sides={5}
                fill={theme.colors.Green2}
                lineWidth={8}
                stroke={`${theme.colors.Green2}88`}
                size={30}
              />
            }
            text={'LocalToWorld'}
            color={theme.colors.Brown2}
          />

          <Txt
            text={'='}
            fontSize={42}
            fontFamily={theme.fonts.mono}
            fill={theme.colors.White}
          />

          <MatrixName text={'LocalToParent'} icon={<RectIcon />} />

          <MatrixName text={'LocalToParent'} icon={<CircleIcon />} />
        </Layout>

        <Layout
          ref={circleLocalToWorld}
          alignItems={'center'}
          gap={32}
          scale={0}
        >
          <MatrixName
            icon={<CircleIcon />}
            text={'LocalToWorld'}
            color={theme.colors.Brown2}
          />

          <Txt
            text={'='}
            fontSize={42}
            fontFamily={theme.fonts.mono}
            fill={theme.colors.White}
          />

          <MatrixName text={'LocalToParent'} icon={<RectIcon />} />
        </Layout>

        <Layout ref={rectLocalToWorld} alignItems={'center'} gap={32} scale={0}>
          <MatrixName
            icon={<RectIcon />}
            text={'LocalToWorld'}
            color={theme.colors.Brown2}
          />

          <Txt
            text={'='}
            fontSize={42}
            fontFamily={theme.fonts.mono}
            fill={theme.colors.White}
          />

          <MatrixName text={'Identity Matrix'} />
        </Layout>
      </Layout>

      <SceneContainer
        ref={scene}
        sceneTree={sceneTree}
        labelText={'Local Space'}
        labelColor={theme.colors.Blue1}
        labelScale={0}
        scale={0}
        height={700}
        y={120}
        showAxis
      >
        <Grid
          ref={rectGrid}
          width={1500}
          height={1700}
          spacing={() => new Vector2(50).mul(rect().scale())}
          rotation={() => rect().rotation()}
          position={() => rect().position()}
          axisStroke={'#63878f'}
          stroke={'#51666c'}
          end={0.5}
          start={0.5}
        />

        <Grid
          ref={circleGrid}
          width={1500}
          height={1700}
          spacing={() =>
            new Vector2(50).mul(rect().scale().mul(circle().scale()))
          }
          rotation={() => circle().absoluteRotation()}
          position={() =>
            circle().position().transformAsPoint(rect().localToParent())
          }
          axisStroke={'#814a4a'}
          stroke={'#574242'}
          start={0.5}
          end={0.5}
        />

        <RectObject
          ref={rect}
          rotation={45}
          scale={1.25}
          position={[-200, 100]}
        >
          <CircleObject ref={circle} position={[300, -200]}>
            <Polygon
              ref={polygon}
              sides={5}
              fill={theme.colors.Green2}
              size={60}
              position={-200}
              scale={0}
            />
          </CircleObject>
        </RectObject>

        <Vector
          ref={localPositionVector}
          from={() => rect().position()}
          to={() =>
            new Vector2(300, -200).transformAsPoint(rect().localToParent())
          }
          end={0}
        />

        <Vector
          ref={parentPositionVector}
          to={() =>
            circle().position().transformAsPoint(rect().localToParent())
          }
          stroke={theme.colors.Green1}
          end={0}
        />

        <Vector
          ref={polygonLocalPositionVector}
          from={() =>
            circle().position().transformAsPoint(rect().localToParent())
          }
          to={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
          }
          stroke={theme.colors.White}
          end={0}
        />

        <Vector
          ref={polygonParentPositionVector}
          from={() => rect().position()}
          to={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
          }
          stroke={theme.colors.White}
          end={0}
        />

        <Vector
          ref={polygonWorldPositionVector}
          to={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
          }
          stroke={theme.colors.Green1}
          end={0}
        />

        <Coordinates
          ref={polygonLocalCoordinates}
          coordinates={() => polygon().position()}
          xColor={theme.colors.Red}
          yColor={theme.colors.Red}
          position={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
              .add(Vector2.down.scale(65))
          }
          scale={0}
        />

        <Coordinates
          ref={polygonParentPosCoordinates}
          coordinates={() =>
            polygon().position().transformAsPoint(circle().localToParent())
          }
          xColor={theme.colors.Blue1}
          yColor={theme.colors.Blue1}
          left={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
              .add(Vector2.right.scale(50))
          }
          scale={0}
        />

        <Coordinates
          ref={polygonWorldPosCoordinates}
          coordinates={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
          }
          right={() =>
            polygon()
              .absolutePosition()
              .transformAsPoint(scene().worldToLocal())
              .add(Vector2.left.scale(50))
          }
          scale={0}
        />

        <Coordinates
          ref={localPosCoordinates}
          coordinates={[300, -200]}
          xColor={theme.colors.Blue1}
          yColor={theme.colors.Blue1}
          scale={0}
          position={() =>
            circle()
              .position()
              .transformAsPoint(rect().localToParent())
              .add(Vector2.up.scale(70))
          }
        />

        <Coordinates
          ref={parentPosCoordinates}
          coordinates={() =>
            circle().position().transformAsPoint(rect().localToParent())
          }
          xColor={theme.colors.Brown2}
          yColor={theme.colors.Brown2}
          scale={0}
          position={() =>
            circle()
              .position()
              .transformAsPoint(rect().localToParent())
              .add(Vector2.down.scale(70))
          }
        />
      </SceneContainer>

      <SurroundingRectangle
        ref={highlightRect}
        stroke={theme.colors.Green1}
        fill={`${theme.colors.Green1}31`}
        lineWidth={4}
        buffer={[0, 26]}
        radius={8}
        zIndex={-1}
        nodes={() => rotationMatrix()}
        scale={0}
        smoothCorners
      />
    </>,
  );

  yield* slideTransition(Direction.Right, 0.7);

  yield* waitUntil('show label');
  matrixLabel().text('LocalToParent');
  yield* typewrite(matrixLabel(), 0.8);

  yield* waitUntil('show scene');
  yield* sequence(
    0.4,
    all(
      matrixLabel().position.y(-800, 0.7),
      localToParentMatrix().height(200, 0.8),
      localToParentMatrix().position.y(-390, 0.8),
    ),
    scene().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show local space');
  yield* all(
    rectGrid().start(0, 0.7),
    rectGrid().end(1, 0.7),
    scene().labelScale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('show local vec');
  yield* localPositionVector().end(1, 0.7);
  yield* localPosCoordinates().show();

  yield* waitUntil('show parent space');
  yield* sequence(
    0.6,
    showParentSpace(),
    sequence(
      0.3,
      parentPositionVector().end(1, 0.7),
      parentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show local space 2');
  yield* all(
    showLocalSpace(),
    parentPositionVector().end(0, 0.6),
    parentPosCoordinates().hide(),
    delay(0.5, sceneTree.highlightNode('rect', 0.7, theme.colors.Blue1)),
  );

  yield* waitUntil('move up level');
  yield* sequence(
    0.55,
    all(
      showParentSpace(),
      localPositionVector().end(0, 0.5),
      localPosCoordinates().hide(),
      sceneTree.highlightNode('root', 0.6, theme.colors.Brown3),
    ),
    sequence(
      0.4,
      parentPositionVector().end(1, 0.6),
      parentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show local space 3');
  yield* all(
    showLocalSpace(),
    parentPositionVector().end(0, 0.6),
    parentPosCoordinates().hide(),
    sceneTree.resetHighlight(),
    delay(
      0.5,
      all(localPosCoordinates().show(), localPositionVector().end(1, 0.6)),
    ),
  );

  yield* waitUntil('show parent pos');
  yield* sequence(
    0.2,
    parentPositionVector().end(1, 0.7),
    parentPosCoordinates().show(),
  );

  yield* waitUntil('hide parent pos');
  localToParentMatrix().save();
  yield* all(
    parentPositionVector().end(0, 0.7),
    parentPosCoordinates().hide(),
    scene().position.y(0, 0.7),
    localToParentMatrix().position.y(-800, 0.7),
  );

  parentPosCoordinates()
    .position(localPosCoordinates().position())
    .coordinates([300, -200])
    .xColor(theme.colors.Blue1)
    .yColor(theme.colors.Blue1)
    .reparent(view);

  yield* waitUntil('move local pos');
  parentPosCoordinates().scale(1);
  yield* parentPosCoordinates().position([740, 0], 1);

  yield* waitUntil('show parent space 2');
  yield* showParentSpace();

  yield* waitUntil('show wrong pos');
  parentPositionVector().to([300, -200]);
  yield* all(
    parentPositionVector().end(1, 0.7),
    parentPosCoordinates().xColor(theme.colors.Brown2, 0.6),
    parentPosCoordinates().yColor(theme.colors.Brown2, 0.6),
    parentPosCoordinates().position(
      () => new Vector2(300, -230).transformAsPoint(scene().localToParent()),
      0.7,
    ),
  );

  yield* waitUntil('show matrix');
  yield* all(scene().position.y(120, 0.7), localToParentMatrix().restore(0.7));

  yield* waitUntil('decompose matrix');
  yield* swapNodes(localToParentMatrix(), matrixContainer());

  yield* waitUntil('highlight scaling');
  parentPosCoordinates().coordinates(() => parentPositionVector().to());
  yield* all(
    highlightRect().nodes(scalingMatrix, 0),
    highlightRect().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('scale pos');
  const scaledPos = parentPositionVector().to().mul(rect().scale());
  yield* all(
    parentPositionVector().to(scaledPos, 1),
    translate(parentPosCoordinates(), [-50, -20], 1),
  );

  yield* waitUntil('highlight local space');
  yield* showLocalSpace();

  yield* waitUntil('scale local space');
  parentPosCoordinates().right(() =>
    parentPositionVector()
      .to()
      .transformAsPoint(scene().localToParent())
      .add([-45, 0]),
  );
  yield* loop(2, () => {
    return chain(
      all(rect().scale(1, 1), parentPositionVector().to([300, -200], 1)),
      waitFor(0.2),
      all(rect().scale(1.25, 1), parentPositionVector().to(scaledPos, 1)),
      waitFor(0.5),
    );
  });

  yield* waitUntil('parent space');
  yield* all(showParentSpace(), highlightRect().nodes(rotationMatrix(), 0.7));

  yield* waitUntil('rotate pos');
  yield* parentPositionVector().to(
    rotatePoint(parentPositionVector().to(), rect().rotation()),
    1,
    easeInOutCubic,
    createPolarLerp(),
  );

  yield* waitUntil('highlight local space 2');
  yield* showLocalSpace();

  yield* waitUntil('rotate local');
  const rotatedPos = parentPositionVector().to();
  yield* loop(2, () => {
    return chain(
      all(
        rect().rotation(0, 1.2),
        parentPositionVector().to(
          scaledPos,
          1.2,
          easeInOutCubic,
          createPolarLerp(),
        ),
      ),
      waitFor(0.2),
      all(
        rect().rotation(45, 1.2),
        parentPositionVector().to(
          rotatedPos,
          1.2,
          easeInOutCubic,
          createPolarLerp(),
        ),
      ),
      waitFor(0.5),
    );
  });

  yield* waitUntil('parent space 2');
  yield* all(
    showParentSpace(),
    highlightRect().nodes(translationMatrix(), 0.7),
  );

  yield* waitUntil('translate pos');
  yield* all(
    parentPositionVector().to(
      () => circle().position().transformAsPoint(rect().localToParent()),
      1,
    ),
    parentPosCoordinates().position(
      () =>
        circle()
          .absolutePosition()
          .transformAsPoint(view.worldToLocal())
          .add([0, -70]),
      0.7,
    ),
  );

  yield* waitUntil('highlight local space 3');
  yield* showLocalSpace();

  yield* waitUntil('translate local');
  yield* loop(2, () =>
    rect().position(0, 1).wait(0.2).to([-200, 100], 1).wait(0.5),
  );

  yield* waitUntil('parent space 3');
  yield* all(
    showParentSpace(),
    highlightRect().scale(0, 0.6, easeInBack),
    swapNodes(matrixContainer(), localToParentMatrix()),
  );

  yield* waitUntil('center matrix');
  localToParentMatrix().width(DEFAULT);
  yield* all(
    scene().position.y(1000, 0.7),
    localToParentMatrix().position.y(0, 0.7),
    localToParentMatrix().height(280, 0.7),
  );

  yield* waitUntil('show label 2');
  yield* matrixLabel().position.y(-300, 0.9);
  parentPosCoordinates().scale(0);
  parentPositionVector().end(0);

  yield* waitUntil('show scene 2');
  yield* all(
    scene().position.y(0, 0.7),
    matrixLabel().position.y(-1000, 0.7),
    localToParentMatrix().position.y(-700, 0.7),
  );
  yield* showLocalSpace();

  yield* waitUntil('show highlight');
  yield* sceneTree.highlightNode('rect', 0.7, theme.colors.Blue1);

  yield* waitUntil('show parent 4');
  yield* sequence(
    0.6,
    all(
      showParentSpace(),
      localPositionVector().end(0, 0.7),
      localPosCoordinates().hide(),
      sceneTree.highlightNode('root', 0.7, theme.colors.Brown3),
    ),
    sequence(
      0.3,
      parentPositionVector().end(1, 0.7),
      parentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show local 4');
  yield* sequence(
    0.6,
    all(
      showLocalSpace(),
      parentPositionVector().end(0, 0.7),
      parentPosCoordinates().hide(),
      sceneTree.highlightNode('rect', 0.7, theme.colors.Blue1),
    ),
    sequence(
      0.3,
      localPositionVector().end(1, 0.7),
      localPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show parent 5');
  yield* sequence(
    0.6,
    all(
      showParentSpace(),
      localPositionVector().end(0, 0.7),
      localPosCoordinates().hide(),
      sceneTree.highlightNode('root', 0.7, theme.colors.Brown3),
    ),
    sequence(
      0.3,
      parentPositionVector().end(1, 0.7),
      parentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('reset scene');
  yield* all(
    sceneTree.resetHighlight(),
    scene().labelScale(0, 0.7, easeInBack),
    scene().gridStroke(DEFAULT, 0.7),
    scene().axisStroke(DEFAULT, 0.7),
    rectGrid().end(0.5, 0.7),
    rectGrid().start(0.5, 0.7),
    parentPositionVector().end(0, 0.7),
    parentPosCoordinates().hide(),
  );

  yield* waitUntil('show polygon');
  yield* all(
    polygon().scale(1, 0.6, easeOutBack),
    sceneTree.insertObject(
      {
        id: 'polygon',
        label: 'Polygon',
        icon: (
          <Polygon
            sides={5}
            fill={theme.colors.Green2}
            size={10}
            lineWidth={3}
            stroke={`${theme.colors.Green2}88`}
          />
        ),
      },
      2,
    ),
  );

  yield* waitUntil('show circle grid');
  yield* all(
    circleGrid().start(0, 0.7),
    circleGrid().end(1, 0.7),
    sceneTree.highlightNode('circle', 0.7, theme.colors.Red),
    sequence(
      0.4,
      polygonLocalPositionVector().end(1, 0.7),
      polygonLocalCoordinates().show(),
    ),
  );

  yield* waitUntil('show rect local');
  rectGrid().opacity(1);
  yield* circleGrid().opacity(0.3, 0.8);
  yield* all(
    rectGrid().end(1, 0.7),
    rectGrid().start(0, 0.7),
    sceneTree.highlightNode('rect', 0.7, theme.colors.Blue1),
    polygonLocalPositionVector().opacity(0.3, 0.6),
    polygonLocalCoordinates().opacity(0.3, 0.6),
    sequence(
      0.4,
      polygonParentPositionVector().end(1, 0.7),
      polygonParentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show world space');
  yield* all(rectGrid().opacity(0.1, 0.7), circleGrid().opacity(0.1, 0.7));
  yield* all(
    sceneTree.highlightNode('root', 0.8, theme.colors.Green1),
    polygonParentPosCoordinates().opacity(0.3, 0.6),
    polygonParentPositionVector().opacity(0.3, 0.6),
    sequence(
      0.4,
      polygonWorldPositionVector().end(1, 0.7),
      polygonWorldPosCoordinates().show(),
    ),
  );

  yield* waitUntil('move scene');
  yield* all(scene().position.y(130, 0.9), sceneTree.resetHighlight());

  yield* waitUntil('poly local to world');
  yield* polygonLocalToWorld().scale(1, 0.7, easeOutBack);

  yield* waitUntil('circle local to world');
  yield* circleLocalToWorld().scale(1, 0.7, easeOutBack);

  yield* waitUntil('rect local to world');
  yield* rectLocalToWorld().scale(1, 0.7, easeOutBack);

  yield* waitUntil('reset scene 2');
  yield* all(
    matrixNameContainer().position.y(-700, 0.7),
    scene().position.y(0, 0.7),
    polygonWorldPositionVector().end(0, 0.7),
    polygonWorldPosCoordinates().hide(),
    polygonParentPositionVector().end(0, 0.7),
    polygonParentPosCoordinates().hide(),
    polygonLocalPositionVector().end(0, 0.7),
    polygonLocalCoordinates().hide(),
    circleGrid().end(0.5, 0.7),
    circleGrid().start(0.5, 0.7),
    rectGrid().start(0.5, 0.7),
    rectGrid().end(0.5, 0.7),
  );

  yield* waitUntil('show local space 4');
  circleGrid().opacity(1);
  rectGrid().opacity(1);
  polygonLocalPositionVector().opacity(1);
  polygonLocalCoordinates().opacity(1);
  polygonParentPositionVector().opacity(1);
  polygonParentPosCoordinates().opacity(1);
  yield* all(
    circleGrid().end(1, 0.7),
    circleGrid().start(0, 0.7),
    sceneTree.highlightNode('circle', 0.7, theme.colors.Red),
    sequence(
      0.4,
      polygonLocalPositionVector().end(1, 0.7),
      polygonLocalCoordinates().show(),
    ),
  );

  yield* waitUntil('show parent space 3');
  yield* all(
    polygonLocalPositionVector().end(0, 0.7),
    polygonLocalCoordinates().hide(),
    circleGrid().end(0.5, 0.7),
    circleGrid().start(0.5, 0.7),
    sceneTree.highlightNode('rect', 0.7, theme.colors.Blue1),
    highlightRect().nodes(sceneTree.getObject('rect'), 0.7),
    rectGrid().end(1, 0.7),
    rectGrid().start(0, 0.7),
    sequence(
      0.4,
      polygonParentPositionVector().end(1, 0.7),
      polygonParentPosCoordinates().show(),
    ),
  );

  yield* waitUntil('show local space 5');
  yield* all(
    polygonParentPositionVector().end(0, 0.7),
    polygonParentPosCoordinates().hide(),
    rectGrid().end(0.5, 0.7),
    rectGrid().start(0.5, 0.7),
    sceneTree.highlightNode('circle', 0.7, theme.colors.Red),
    circleGrid().end(1, 0.7),
    circleGrid().start(0, 0.7),
    sequence(
      0.4,
      polygonLocalPositionVector().end(1, 0.7),
      polygonLocalCoordinates().show(),
    ),
  );

  yield* waitUntil('move scene 2');
  localToParentMatrix()
    .tex(texColor(`${localToParentTex}^{-1}`, theme.colors.White))
    .height(200);
  yield* all(
    scene().position.y(120, 0.8),
    localToParentMatrix().position.y(-390, 0.8),
  );

  yield* waitUntil('move scene 3');
  yield* all(
    scene().position.y(0, 0.8),
    localToParentMatrix().position.y(-800, 0.8),
  );

  yield* waitUntil('hide scene');
  yield* all(scene().scale(0, 0.7, easeInBack), highlightRect().opacity(0, 0));

  yield* waitUntil('scene end');
});
