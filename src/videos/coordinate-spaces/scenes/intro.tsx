import { CameraView } from '@ksassnowski/motion-canvas-camera';

import { makeScene2D } from '@motion-canvas/2d';
import { Img, Node, Txt } from '@motion-canvas/2d/lib/components';
import {
  CodeBlock,
  edit,
  lines,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {
  all,
  chain,
  delay,
  loop,
  sequence,
  waitFor,
  waitUntil,
} from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator, cancel } from '@motion-canvas/core/lib/threading';
import {
  easeInBack,
  easeInQuint,
  easeOutBack,
  easeOutCubic,
  linear,
} from '@motion-canvas/core/lib/tweening';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import {
  createRef,
  makeRef,
  range,
  useRandom,
} from '@motion-canvas/core/lib/utils';

import { typewrite } from '@common/utils';

import theme from '@theme';

import drinkSprite from '../assets/drink_sprite.png';
import dungeonSprite from '../assets/dungeon.png';
import {
  AnimatedSprite,
  Blood,
  Goblin,
  Hero,
  Spear,
  Torch,
} from '../components';

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const gameScene = createRef<Node>();
  const blood = createRef<AnimatedSprite>();
  const goblin = createRef<AnimatedSprite>();
  const heroine = createRef<AnimatedSprite>();
  const torches: AnimatedSprite[] = [];
  const spear = createRef<Img>();
  const drink = createRef<Img>();
  const code = createRef<CodeBlock>();
  const questionMarks = createRef<Node>();
  const title = createRef<Txt>();

  let heroineAnimation: ThreadGenerator | null;
  let goblinAnimation: ThreadGenerator | null;

  function* showSpear() {
    yield* spear().scale(8, 0.2);
  }

  function* hideSpear(duration = 0.2) {
    yield* spear().scale(0, duration);
  }

  function* attack(times: number) {
    for (let i = 0; i < times; i++) {
      yield* all(
        heroine().playOnce('attack'),
        chain(
          spear().position.x(30, 0.05),
          waitFor(0.4),
          spear().position.x(95, 0.3),
        ),
        chain(blood().scale([-3, 3], 0), blood().playOnce('default')),
      );
      yield* waitFor(times > 1 ? 0.1 : 0);
    }
  }

  yield view.add(
    <>
      <CameraView ref={camera} width={'100%'} height={'100%'}>
        <Node ref={gameScene}>
          <Img src={dungeonSprite} scale={8} y={52} smoothing={false} />

          {range(0, 3).map((i) => (
            <Torch
              ref={makeRef(torches, i)}
              position={[-640 + 640 * i, -348]}
              scale={8}
            />
          ))}

          <Blood
            ref={blood}
            scale={0}
            position={() => goblin().position().sub([50, 0])}
            zIndex={1}
          />
          <Goblin ref={goblin} position={[-770, 160]} scale={0} />
          <Hero ref={heroine} position={[770, 160]} scale={0} />
          <Spear
            ref={spear}
            scale={0}
            position={() => [100, heroine().position.y() + 25]}
          />

          <Img
            ref={drink}
            src={drinkSprite}
            smoothing={false}
            position={() => heroine().position().add([-60, 10])}
            scale={0}
          />
        </Node>

        <CodeBlock
          ref={code}
          code={`
        const effect = new BloodSpatter();
        effect.position = goblinSprite.position;
        scene.add(effect);
      `}
          lineHeight={'160%'}
          fontFamily={theme.fonts.mono}
          opacity={0}
          y={-200}
        />

        <Node
          ref={questionMarks}
          position={() => heroine().position().add([0, -120])}
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
      </CameraView>
      <Txt
        ref={title}
        fontFamily={theme.fonts.serif}
        fontSize={96}
        fontWeight={600}
        fill={theme.colors.White}
        text={'Coordinate Spaces'}
        opacity={0}
      />
    </>,
  );

  camera().clip(false);
  yield all(...torches.map((torch) => torch.loop('default')));
  goblinAnimation = yield goblin().loop('walk');
  heroineAnimation = yield heroine().loop('walk');

  yield* waitUntil('enter heroine');
  heroine().scale([-8, 8]);
  yield* heroine().position.x(128, 1.6, linear);
  cancel(heroineAnimation);
  heroineAnimation = yield heroine().loop('idle');

  yield* waitUntil('enter goblin');
  goblin().scale(8);
  yield* goblin().position.x(-72, 1.6, linear);
  cancel(goblinAnimation);
  goblinAnimation = yield goblin().loop('idle');

  yield* waitUntil('attack 1');
  yield* showSpear();
  yield* waitFor(0.2);
  cancel(heroineAnimation);
  yield* attack(6);
  heroineAnimation = yield heroine().loop('idle');
  yield* waitFor(0.2);
  yield* hideSpear();

  yield* waitUntil('show code 1');
  code().save();
  gameScene().save();
  yield* sequence(
    0.4,
    gameScene().position.y(700, 1),
    all(code().position.y(0, 1, easeOutCubic), code().opacity(1, 1)),
  );

  yield* waitUntil('highlight code 1');
  yield* code().selection(lines(0), 0.5);

  yield* waitUntil('highlight code 2');
  yield* code().selection(lines(1), 0.6);

  yield* waitUntil('highlight code 3');
  yield* code().selection(lines(2), 0.6);

  yield* waitUntil('highlight code 4');
  yield* code().selection(DEFAULT, 0.4);

  yield* waitUntil('hide code 2');
  yield* all(code().restore(0.8), gameScene().restore(1.2));

  yield* waitUntil('attack 2');
  cancel(heroineAnimation);
  blood().absolutePosition(Vector2.zero);
  yield* showSpear();
  yield* waitFor(0.2);
  const stab = yield attack(Infinity);

  yield* waitUntil('comedic zoom');
  camera().save();
  yield* camera().zoomOnto(
    BBox.fromPoints(new Vector2(-700, -400), new Vector2(0, 0)),
    0,
  );

  yield* waitUntil('restore camera');
  cancel(stab, heroineAnimation);
  heroineAnimation = yield heroine().loop('idle');
  yield* all(hideSpear(0), camera().restore(0));

  yield* waitUntil('comedic zoom 2');
  const zoomPosition = new BBox(
    heroine()
      .absolutePosition()
      .transformAsPoint(camera().worldToLocal())
      .add([0, 50]),
    heroine().size(),
  );
  camera().save();
  yield* camera().zoomOnto(zoomPosition, 0, 250);

  yield* waitUntil('comedic zoom 3');
  yield* camera().zoomOnto(zoomPosition, 0, 120);

  yield* waitUntil('restore camera 2');
  yield* camera().restore(0);

  yield* waitUntil('show code 2');
  gameScene().save();
  code().save();
  yield* sequence(
    0.4,
    gameScene().position.y(700, 1),
    all(code().position.y(0, 1, easeOutCubic), code().opacity(1, 1)),
  );

  yield* waitUntil('change code 1');
  yield* code().edit(1.8)`
    const effect = new BloodSpatter();
    ${edit(
      `effect.position`,
      `effect.globalPosition`,
    )} = ${edit(`goblinSprite.position`, `goblinSprite.globalPosition`)};
    scene.add(effect);
  `;

  yield* waitUntil('change code 2');
  yield* code().edit(1.8)`
    const effect = new BloodSpatter();
    ${edit(`effect.globalPosition`, `effect.position`)} = ${edit(
    `goblinSprite.globalPosition`,
    `goblinSprite
                      .parent()
                      .localToWorld(goblinSprite.position)`,
  )};
    scene.add(effect);
  `;

  yield* waitUntil('change code 3');
  yield* code().edit(1.8, false)`
    const effect = new BloodSpatter();
    effect.position = goblinSprite
                        .parent()
                        .${edit(
                          `localToWorld`,
                          `localToParent`,
                        )}(goblinSprite.position);
    scene.add(effect);
  `;

  yield* waitUntil('hide code 3');
  yield* all(
    code().opacity(0, 0.8),
    code().position.y(-500, 1.1),
    gameScene().restore(1.2),
  );

  yield* waitUntil('show question marks');
  yield* sequence(
    0.1,
    ...questionMarks()
      .children()
      .map((child) => child.scale(1, 0.3, easeOutBack)),
  );

  yield* waitUntil('hide question marks');
  yield* sequence(
    0.08,
    ...questionMarks()
      .children()
      .reverse()
      .map((child) => child.scale(0, 0.3, easeInBack)),
  );

  yield* waitUntil('show spear');
  yield* showSpear();

  yield* waitUntil('random blood');
  const random = useRandom();
  cancel(heroineAnimation);
  yield* loop(3, () => {
    const position = new Vector2(
      random.nextInt(-800, 800),
      random.nextInt(-500, 500),
    );

    blood().position(position);
    return all(blood().playOnce('default'), attack(1));
  });
  yield* hideSpear();
  cancel(heroineAnimation);
  heroineAnimation = yield heroine().loop('idle');

  yield* waitUntil('show drink');
  yield camera().centerOn(goblin(), 4, linear);
  yield* drink().scale(5.5, 0.3, easeOutBack);

  yield* waitUntil('sit down');
  cancel(heroineAnimation);
  heroineAnimation = yield heroine().loop('walk');
  yield* heroine().position.x(goblin().position.x(), 0.5, linear);
  cancel(heroineAnimation, goblinAnimation);
  yield* waitFor(0.2);
  heroine().frame(2);
  drink().position(heroine().position().add([-50, 40]));
  blood()
    .zIndex(0)
    .scale([-3.5, 3.5])
    .rotation(80)
    .position(goblin().position().add([25, -10]));
  goblin().remove();
  yield blood().playOnce('stain');

  yield* waitUntil('drink');
  yield loop(Infinity, () => {
    return chain(
      all(
        drink().rotation(40, 0.6),
        drink().position(heroine().position().add([-40, 30]), 0.6),
      ),
      waitFor(0.7),
      all(
        drink().rotation(0, 0.6),
        drink().position(heroine().position().add([-50, 50]), 0.6),
      ),
      waitFor(1),
    );
  });

  yield* waitUntil('show title');
  yield* all(
    camera().zoom(30, 10, easeInQuint),
    delay(9, all(title().opacity(1, 0), typewrite(title(), 2))),
    delay(4, gameScene().opacity(0, 6, linear)),
  );

  yield* waitUntil('scale title');
  yield* title().scale(300, 2.4);

  yield* waitUntil('scene end');
});
