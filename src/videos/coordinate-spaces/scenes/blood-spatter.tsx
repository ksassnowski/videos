import { CameraView } from '@ksassnowski/motion-canvas-camera';

import {
  Circle,
  Img,
  Layout,
  Node,
  Rect,
  makeScene2D,
} from '@motion-canvas/2d';
import {
  CodeBlock,
  edit,
  lines,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {
  BBox,
  DEFAULT,
  Matrix2D,
  Vector2,
  all,
  cancel,
  chain,
  createRef,
  easeInBack,
  easeOutBack,
  linear,
  makeRef,
  range,
  sequence,
  useScene,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';

import { group, translate } from '@common/utils';

import theme from '@theme';

import dungeonSprite from '../assets/dungeon.png';
import {
  AnimatedSprite,
  Blood,
  Coordinates,
  ExtendedGameSceneTree,
  Goblin,
  Grid,
  Hero,
  SceneTree,
  Spear,
  Torch,
} from '../components';

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const tiles = createRef<Node>();
  const dungeon = createRef<Img>();
  const goblin = createRef<AnimatedSprite>();
  const heroine = createRef<AnimatedSprite>();
  const spear = createRef<AnimatedSprite>();
  const blood = createRef<AnimatedSprite>();
  const grid = createRef<Grid>();
  const goblinGrid = createRef<Grid>();
  const torches: AnimatedSprite[] = [];
  const code = createRef<CodeBlock>();
  const codeWrapper = createRef<Rect>();
  const sceneTree = createRef<SceneTree>();
  const goblinSpriteCoordinates = createRef<Rect>();
  const worldZeroCoordinates = createRef<Coordinates>();
  const worldSpaceOrigin = createRef<Circle>();

  const { x: sceneWidth, y: sceneHeight } = useScene().getSize();
  const TILE_SIZE = 128;
  const NUM_ROWS = sceneHeight / TILE_SIZE;
  const NUM_COLS = sceneWidth / TILE_SIZE;

  let heroineAnimation: ThreadGenerator | null;
  let goblinAnimation: ThreadGenerator | null;

  function* showSpear() {
    yield* spear().scale(-1, 0.2);
  }

  function* hideSpear(duration = 0.2) {
    yield* spear().scale(0, duration);
  }

  function* attack(times: number) {
    for (let i = 0; i < times; i++) {
      yield* all(
        heroine().playOnce('attack'),
        chain(
          translate(spear(), [10, 0], 0.05),
          waitFor(0.4),
          translate(spear(), [0, 0], 0.3),
        ),
        chain(blood().scale([-3, 3], 0), blood().playOnce('default')),
      );
      yield* waitFor(times > 1 ? 0.1 : 0);
    }
  }

  function* attackSequence(times: number) {
    yield* showSpear();
    yield* waitFor(0.2);
    cancel(heroineAnimation);
    yield* attack(times);
    heroineAnimation = yield heroine().loop('idle');
    yield* waitFor(0.2);
    yield* hideSpear();
  }

  function* focus() {
    yield* all(
      camera().opacity(0.1, 0.8),
      sceneTree().position([-500, 0], 0.8),
      codeWrapper().position([400, 0], 0.8),
    );
  }

  function* unfocus() {
    yield* all(
      camera().opacity(1, 0.8),
      codeWrapper().position([515, -410], 0.8),
      sceneTree().topLeft(
        () =>
          view
            .topLeft()
            .transformAsPoint(view.localToParent().inverse())
            .add(30),
        0.8,
      ),
    );
  }

  yield view.add(
    <>
      <CameraView ref={camera} width={'100%'} height={'100%'} clip={false}>
        <Grid
          ref={grid}
          width={8000}
          height={8000}
          position={() =>
            camera()
              .topLeft()
              .transformAsPoint(camera().localToParent().inverse())
          }
          spacing={() => new Vector2(TILE_SIZE)}
          lineWidth={() => Vector2.one.div(camera().scale()).x}
          axisLineWidth={() => 3 / camera().scale().x}
          stroke={'#363637'}
          axisStroke={'#454545'}
          start={0.5}
          end={0.5}
        />

        <Img
          ref={dungeon}
          src={dungeonSprite}
          scale={8}
          y={38}
          smoothing={false}
        />

        {range(0, 3).map((i) => (
          <Torch
            ref={makeRef(torches, i)}
            position={[-640 + 640 * i, -348]}
            scale={8}
          />
        ))}

        <Grid
          ref={goblinGrid}
          width={8000}
          height={8000}
          position={() => goblin().position().add(Vector2.up.scale(30))}
          spacing={TILE_SIZE}
          stroke={'#2e362e'}
          axisStroke={'#37503d'}
          lineWidth={() => Vector2.one.div(camera().scale()).x}
          axisLineWidth={() => 3 / camera().scale().x}
          end={0.5}
          start={0.5}
        />

        <Blood
          ref={blood}
          scale={0}
          position={() =>
            camera()
              .topLeft()
              .transformAsPoint(camera().localToParent().inverse())
          }
          zIndex={1}
        />
        <Goblin ref={goblin} position={[-770, 140]} scale={0} />
        <Hero ref={heroine} position={[770, 140]} scale={0}>
          <Spear ref={spear} scale={0} position={[3, 12]} />
        </Hero>
      </CameraView>

      <Coordinates
        ref={goblinSpriteCoordinates}
        position={[100, -70]}
        coordinates={Vector2.zero}
        xColor={theme.colors.Green2}
        yColor={theme.colors.Green2}
        scale={0}
      />

      <Coordinates
        ref={worldZeroCoordinates}
        position={() => camera().topLeft().add([60, -30])}
        coordinates={Vector2.zero}
        scale={0}
      />

      <Circle
        ref={worldSpaceOrigin}
        size={12}
        fill={theme.colors.White}
        position={() => camera().topLeft()}
        scale={0}
      />

      <Rect
        ref={codeWrapper}
        fill={`${theme.colors.Gray5}dd`}
        padding={[32, 32, 20, 32]}
        radius={12}
        position={[515, -410]}
        scale={0}
        smoothCorners
        layout
      >
        <CodeBlock
          ref={code}
          code={`
        const effect = new BloodSpatter();
        effect.position = goblinSprite.position;
        scene.add(effect);`}
          lineHeight={'160%'}
          fontSize={36}
          fontFamily={theme.fonts.mono}
          layout
        />
      </Rect>

      <ExtendedGameSceneTree
        ref={sceneTree}
        opacity={0}
        scale={2}
        containerFill={`${theme.colors.Gray5}dd`}
        topLeft={() =>
          view
            .topLeft()
            .transformAsPoint(view.localToParent().inverse())
            .add(30)
        }
      />

      <Layout
        ref={tiles}
        compositeOperation={'destination-in'}
        width={'100%'}
        height={'100%'}
        wrap={'wrap'}
        layout
      >
        {range(NUM_ROWS).map(() =>
          range(NUM_COLS).map(() => (
            <Rect size={TILE_SIZE} fill={'#121214'} scale={0} />
          )),
        )}
      </Layout>
    </>,
  );

  yield all(...torches.map((torch) => torch.loop('default')));
  goblinAnimation = yield goblin().loop('walk');
  heroineAnimation = yield heroine().loop('walk');

  yield* sequence(
    0.09,
    ...range(NUM_ROWS).map((i) =>
      sequence(
        0.02,
        ...tiles()
          .children()
          .slice(i * NUM_COLS, i * NUM_COLS + NUM_COLS)
          .map((node) => (node as Layout).scale(1, 0.3, linear)),
      ),
    ),
  );
  // No point in having to handle hundreds of tiles on every frame after the
  // initial animation.
  tiles().remove();

  yield* waitUntil('enter chars');
  heroine().scale([-8, 8]);
  goblin().scale(8);
  yield* all(
    heroine().position.x(128, 1.6, linear),
    goblin().position.x(-72, 1.6, linear),
  );
  cancel(heroineAnimation);
  cancel(goblinAnimation);
  heroineAnimation = yield heroine().loop('idle');
  goblinAnimation = yield goblin().loop('idle');

  yield* waitUntil('attack');
  yield* showSpear();
  yield* waitFor(0.2);
  cancel(heroineAnimation);
  const stab = yield attack(Infinity);

  yield* waitUntil('zoom on blood');
  camera().save();
  yield* camera().zoomOnto(blood(), 0, 800);

  yield* waitUntil('stop attack');
  cancel(stab, heroineAnimation);
  heroineAnimation = yield heroine().loop('idle');
  yield* hideSpear(0);

  yield* waitUntil('reset camera');
  yield* camera().restore(0);

  yield* waitUntil('show code');
  yield* codeWrapper().scale(1, 0.6, easeOutBack);

  yield* waitUntil('show scene tree');
  yield* sceneTree().create(0.6);

  yield* waitUntil('focus');
  yield* focus();

  yield* waitUntil('highlight code');
  yield* code().selection(lines(1), 1);

  yield* waitUntil('highlight goblin sprite node');
  yield* sceneTree().highlightNode('goblin-sprite', 0.6);

  yield* waitUntil('highlight goblin node');
  yield* sceneTree().highlightNode('goblin', 0.6, theme.colors.Red);

  yield* waitUntil('hide highlight');
  yield* sceneTree().resetHighlight(0.6);

  yield* waitUntil('reset scene');
  yield* unfocus();

  const g = group(...torches, heroine(), dungeon(), codeWrapper());
  yield* waitUntil('goblin local space');
  cancel(goblinAnimation);
  camera().save();
  yield* sequence(
    0.4,
    all(
      camera().centerOn(goblinGrid(), 1),
      // @ts-ignore
      g.opacity(0, 0.8),
      sceneTree().highlightNode('goblin', 0.7, theme.colors.Green1),
    ),
    all(goblinGrid().start(0, 1), goblinGrid().end(1, 1)),
  );

  yield* waitUntil('show coords');
  yield* goblinSpriteCoordinates().scale(1.5, 0.7, easeOutBack);

  yield* waitUntil('show full scene');
  goblinAnimation = yield goblin().loop('idle');
  yield* all(
    camera().restore(0.7),
    goblinGrid().start(1, 0.7),
    sceneTree().resetHighlight(),
    goblinSpriteCoordinates().scale(0, 0.7),
    // @ts-ignore
    g.opacity(1, 0.7),
  );

  yield* waitUntil('focus 2');
  yield* focus();

  yield* waitUntil('highlight code 2');
  yield* code().selection(lines(2), 0.7);

  yield* waitUntil('insert sprite');
  yield* sceneTree().insertObject({
    id: 'blood',
    label: 'Blood',
    icon: (
      <Rect
        size={8}
        lineWidth={3}
        stroke={`${theme.colors.Red}88`}
        fill={theme.colors.Red}
        radius={2}
        smoothCorners
      />
    ),
  });

  yield* waitUntil('reset');
  yield* all(unfocus(), codeWrapper().opacity(0, 0.7));

  yield* waitUntil('zoom out camera');
  // lmao
  const worldZeroBBox = BBox.fromPoints(
    ...BBox.fromSizeCentered(new Vector2(200)).transformCorners(
      Matrix2D.fromTranslation(
        Vector2.zero.transformAsPoint(camera().worldToLocal()),
      ).domMatrix,
    ),
  );
  yield* sequence(
    0.4,
    camera().zoomOnto(worldZeroBBox, 1.2, TILE_SIZE * 25),
    all(grid().end(1, 1), grid().start(0, 1)),
  );

  yield* waitUntil('show world origin');
  yield* all(
    worldSpaceOrigin().scale(1, 0.7, easeOutBack),
    worldSpaceOrigin().ripple(1),
    worldZeroCoordinates().show(),
  );

  yield* waitUntil('attack 2');
  yield* attackSequence(3);

  yield* waitUntil('zoom in');
  yield* all(camera().zoom(0.4, 1), camera().shift(new Vector2(200, 400), 1));

  yield* waitUntil('move');
  yield* all(
    translate(goblin(), [380, 120], 0.8),
    translate(heroine(), [380, 120], 0.8),
  );

  yield* waitUntil('attack 3');
  yield* attackSequence(2);

  yield* waitUntil('move 2');
  yield* all(
    translate(goblin(), [-635, -240], 0.8),
    translate(heroine(), [-635, -240], 0.8),
  );

  yield* waitUntil('attack 4');
  yield* attackSequence(2);

  yield* waitUntil('reset camera 2');
  code().selection(lines(0, 2));
  codeWrapper().opacity(1).scale(0);
  yield* sequence(
    0.5,
    camera().reset(1),
    codeWrapper().scale(1, 0.7, easeOutBack),
  );

  yield* waitUntil('focus 3');
  yield* focus();

  yield* waitUntil('show code 2');
  yield* all(
    code().selection(lines(1), 0.7),
    sceneTree().highlightNode('goblin-sprite', 0.7),
  );

  yield* waitUntil('use gobo pos');
  yield* all(
    sceneTree().highlightNode('goblin', 0.7),
    code().edit(0.7)`
const effect = new BloodSpatter();
effect.position = ${edit('goblinSprite.position', 'goblin.position')};
scene.add(effect);`,
  );

  yield* waitUntil('use sprite pos');
  yield* all(
    sceneTree().highlightNode('goblin-sprite', 0.7),
    code().edit(0.7, false)`
const effect = new BloodSpatter();
effect.position = ${edit('goblin.position', 'goblinSprite.position')};
scene.add(effect);`,
    code().selection(lines(1), 0.7),
  );

  yield* waitUntil('compute world pos');
  yield* code().edit(1.3)`
const effect = new BloodSpatter();
${edit(
  'effect.position = goblinSprite.position;',
  `const worldPos = goblin.localToParent(
  goblinSprite.position
);
effect.position = worldPos;`,
)}
scene.add(effect);`;

  yield* waitUntil('set global pos');
  yield* code().edit(1.2)`
const effect = new BloodSpatter();
${edit(
  `const worldPos = goblin.localToParent(
  goblinSprite.position
);
effect.position = worldPos;`,
  `effect.globalPosition = goblinSprite.globalPosition;`,
)}
scene.add(effect);`;

  yield* waitUntil('unfocus');
  yield* all(
    unfocus(),
    codeWrapper().opacity(0, 0.7),
    sceneTree().resetHighlight(),
  );

  yield* waitUntil('hide scene tree');
  yield* sceneTree().scale(0, 0.7, easeInBack);

  yield* waitUntil('zoom out forever');
  worldZeroCoordinates().reparent(camera());
  worldSpaceOrigin().reparent(camera());
  yield camera().zoom(0.01, 40, linear);

  yield* waitUntil('fade out');
  yield* camera().opacity(0, 5, linear);

  yield* waitUntil('scene end');
});
