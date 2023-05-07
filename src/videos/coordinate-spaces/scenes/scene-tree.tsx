import { makeScene2D } from '@motion-canvas/2d';
import { Img, Layout, Node } from '@motion-canvas/2d/lib/components';
import { CodeBlock } from '@motion-canvas/2d/lib/components/CodeBlock';
import {
  all,
  chain,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { createComputed } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator, cancel } from '@motion-canvas/core/lib/threading';
import {
  easeInBack,
  easeOutBack,
  linear,
} from '@motion-canvas/core/lib/tweening';
import { createRef, useRandom } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import {
  AnimatedSprite,
  Blood,
  Control,
  Cursor,
  Goblin,
  Goblin8x8,
  Hero,
  Hero8x8,
  SceneContainer,
  SceneTree,
  Spear,
  Spear8x8,
  TransformationRig,
} from '../components';

export default makeScene2D(function* (view) {
  const sceneTree = createRef<SceneTree>();
  const sceneContainer = createRef<Layout>();
  const cursor = createRef<Cursor>();
  const hero = createRef<AnimatedSprite>();
  const spear = createRef<Img>();
  const goblin = createRef<AnimatedSprite>();
  const blood = createRef<AnimatedSprite>();
  const code = createRef<CodeBlock>();
  const heroGroup = createRef<Layout>();
  const heroWrapper = createRef<Node>();
  const rig = createRef<TransformationRig>();

  function* attack(times: number) {
    for (let i = 0; i < times; i++) {
      yield* all(
        hero().playOnce('attack'),
        chain(
          spear().position.x(100, 0.05),
          waitFor(0.3),
          spear().position.x(34, 0.3),
        ),
        chain(blood().scale([-3, 3], 0), blood().playOnce('default')),
      );
      yield* waitFor(times > 1 ? 0.2 : 0);
    }
  }

  const heroIcon = <Hero8x8 scale={3} />;
  const spearIcon = <Spear8x8 scale={3} />;
  const goblinIcon = <Goblin8x8 scale={3} />;

  yield view.add(
    <>
      <SceneTree
        ref={sceneTree}
        fill={theme.colors.Gray5}
        objects={[
          { id: 'goblin', icon: goblinIcon, label: 'Goblin' },
          {
            id: 'hero',
            icon: heroIcon,
            label: 'Hero',
            children: [
              {
                id: 'spear',
                icon: spearIcon,
                label: 'Spear',
              },
            ],
          },
        ]}
        y={-270}
        x={-360}
        scale={1.5}
        opacity={0}
        zIndex={1}
      />

      <SceneContainer
        ref={sceneContainer}
        grow={1}
        lineWidth={6}
        stroke={theme.colors.Gray3}
        radius={16}
        smoothCorners
        scale={0}
      >
        <Blood ref={blood} position={-400} scale={0} />
        <Goblin ref={goblin} scale={[-8, 8]} position={[600, 70]} />

        <TransformationRig
          ref={rig}
          scale={0}
          lineWidth={1}
          stroke={theme.colors.White}
          fill={theme.colors.Gray5}
          node={() => heroGroup()}
          spacing={[0, 40, 0, 0]}
        />

        <Layout ref={heroGroup} position={[-100, 64]} size={[230, 200]}>
          <Node ref={heroWrapper} x={-600}>
            <Hero ref={hero} scale={8} />
            <Spear ref={spear} scale={0} position={[34, 20]} />
          </Node>
        </Layout>
      </SceneContainer>

      <Cursor ref={cursor} scale={0} />

      <CodeBlock
        ref={code}
        code={`hero.position = new Vector2(-100, 0)`}
        fontSize={32}
        fontFamily={theme.fonts.mono}
        position={[150, -330]}
        scale={0}
      />
    </>,
  );

  let heroAnimation: ThreadGenerator = yield hero().loop('walk');
  let goblinAnimation: ThreadGenerator = yield goblin().loop('walk');

  yield* waitUntil('show scene container');
  yield* sceneContainer().scale(1, 0.6, easeOutBack);

  yield* waitUntil('enter sprites');
  yield* heroWrapper().position.x(0, 1, linear);
  hero().frame(0);
  cancel(heroAnimation);
  yield* spear().scale([-8, 8], 0.3);

  yield* waitUntil('enter gobo');
  yield* goblin().position.x(100, 1, linear);
  goblin().frame(0);
  cancel(goblinAnimation);

  yield* waitUntil('show scene tree');
  yield* sequence(0.1, sceneTree().create(0.6));

  yield* waitUntil('highlight objects');
  const pairs: [string, Node][] = [
    ['goblin', goblin()],
    ['hero', hero()],
    ['spear', spear()],
  ];
  for (const [id, sprite] of pairs) {
    sprite.save();
    yield* all(
      sceneTree().highlightNode(id, 1.2),
      sprite.scale(sprite.scale().scale(1.2), 1),
    );
    yield* all(sprite.restore(0.6), sceneTree().resetNode(id, 0.6));
  }

  yield* waitUntil('highlight spear');
  spear().save();
  yield* all(
    sceneTree().highlightNode('spear', 0.7),
    spear().scale(spear().scale().scale(1.4), 0.7),
  );
  yield* all(sceneTree().resetNode('spear', 0.6), spear().restore(0.6));

  yield* waitUntil('highlight hero');
  hero().save();
  yield* all(
    sceneTree().highlightNode('hero', 0.7),
    hero().scale(hero().scale().scale(1.4), 0.7),
  );

  yield* waitUntil('reset hero');
  yield* all(sceneTree().resetNode('hero', 0.6), hero().restore(0.6));

  yield* waitUntil('attack');
  const random = useRandom(42);
  for (let i = 0; i < 4; i++) {
    blood().position([random.nextInt(-600, 600), random.nextInt(-600, 600)]);
    yield* attack(1);
    yield* waitFor(0.1);
  }

  yield* waitUntil('show cursor');
  yield* cursor().show();

  yield* waitUntil('move to hero');
  yield* cursor().absolutePosition(
    hero().absolutePosition().add([45, 160]),
    0.6,
  );

  yield* waitUntil('drag hero');
  heroWrapper().save();
  yield* cursor().clickAndDrag(heroWrapper(), [-100, [200, -200]], 0.6, {
    dragOffset: [-5, -13],
    ghostOpacity: 0,
  });
  yield* cursor().hide();

  yield* waitUntil('show code');
  yield* code().scale(1, 0.5);

  yield* waitUntil('move by code');
  yield* heroWrapper().restore(0.7);

  yield* waitUntil('hide code');
  yield* code().scale(0, 0.6);

  yield* waitUntil('move hero');
  heroWrapper().save();
  yield* heroWrapper()
    .position([-200, 100], 1)
    .to([-300, 0], 1)
    .to([200, -300], 1);
  yield* heroWrapper().restore(1.2);

  yield* waitUntil('show cursor 2');
  yield* cursor().show();

  yield* waitUntil('show transform rig');
  yield* rig().scale(1, 0.4, easeOutBack);

  yield* waitUntil('cursor to corner');
  const scaleControl = createComputed(() =>
    rig().control(Control.TopRight).transformAsPoint(rig().localToWorld()),
  );
  yield* cursor().moveToPosition(scaleControl(), 0.75);

  heroGroup().save();
  yield* waitUntil('scale nodes');
  cursor().stickTo(scaleControl);
  yield* heroGroup().scale(1.4, 0.6);

  yield* waitUntil('cursor to rotation');
  const rotationControl = createComputed(() =>
    rig().control(Control.Rotation).transformAsPoint(rig().localToWorld()),
  );
  yield* cursor().moveToPosition(rotationControl(), 0.6);
  cursor().stickTo(rotationControl);

  yield* waitUntil('rotate nodes');
  yield* heroGroup().rotation(25, 0.7);

  yield* waitUntil('reset transform');
  cursor().position(cursor().position());
  yield* sequence(
    0.2,
    rig().scale(0, 0.5),
    cursor().hide(),
    heroGroup().restore(0.6),
  );

  yield* waitUntil('move hero again');
  yield* heroWrapper().position([-100, 100], 1);

  yield* waitUntil('hide everything');
  yield* sequence(
    0.08,
    sceneTree().scale(0, 0.7, easeInBack),
    heroWrapper().scale(0, 0.7, easeInBack),
    goblin().scale(0, 0.7, easeInBack),
    sceneContainer().scale(0, 0.7, easeInBack),
  );

  yield* waitUntil('scene end');
});
