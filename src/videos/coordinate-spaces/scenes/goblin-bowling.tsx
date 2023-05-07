import {
  CacheRectCollider,
  KinematicBody,
  KinematicBodyProps,
  World,
} from '@ksassnowski/motion-canvas-components';

import { makeScene2D } from '@motion-canvas/2d';
import { Img } from '@motion-canvas/2d/lib/components';
import { waitUntil } from '@motion-canvas/core/lib/flow';
import { fadeTransition } from '@motion-canvas/core/lib/transitions';
import { PossibleVector2 } from '@motion-canvas/core/lib/types';
import { createRef, range } from '@motion-canvas/core/lib/utils';

import justGobo from '../assets/just_gobo.png';

const Goblin = ({
  imgScale = [-6, 6],
  expandCollider = 25,
  ...rest
}: KinematicBodyProps & {
  imgScale?: PossibleVector2;
  expandCollider?: number;
}) => (
  <KinematicBody mass={0.5} restitution={1} {...rest}>
    <CacheRectCollider expand={expandCollider}>
      <Img src={justGobo} scale={imgScale} smoothing={false} />
    </CacheRectCollider>
  </KinematicBody>
);

export default makeScene2D(function* (view) {
  const world = createRef<World>();

  yield view.add(
    <World ref={world} gravity={0}>
      <Goblin
        rotation={90}
        x={-1050}
        linearVelocity={[2300, 0]}
        mass={5}
        imgScale={12}
        expandCollider={42}
      />

      <Goblin
        rotation={-90}
        x={1050}
        linearVelocity={[-2300, 0]}
        mass={6}
        imgScale={[-12, 12]}
        expandCollider={42}
      />

      {range(3).flatMap((i) =>
        range(3).map((j) => <Goblin position={[-60 + 60 * j, -60 + 60 * i]} />),
      )}
    </World>,
  );

  yield* fadeTransition(1);

  yield* waitUntil('start simulation');
  yield world().simulate(Infinity);

  yield* waitUntil('scene end');
});
