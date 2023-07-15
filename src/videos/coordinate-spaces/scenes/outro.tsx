import {
  Layout,
  LayoutProps,
  Node,
  Rect,
  makeScene2D,
} from '@motion-canvas/2d';
import { Txt } from '@motion-canvas/2d/lib/components';
import {
  all,
  createRef,
  linear,
  loop,
  range,
  waitUntil,
} from '@motion-canvas/core';
import { slideTransition } from '@motion-canvas/core/lib/transitions';

import theme from '@theme';

const YELLOW = '#FFC66D';
const RED = '#FF6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';

const Trail = (props: LayoutProps) => (
  <Layout layout direction={'column'} gap={30} offsetY={-1} {...props} />
);

export default makeScene2D(function* (view) {
  const logo = createRef<Node>();
  const star = createRef<Node>();
  const trail1 = createRef<Layout>();
  const trail2 = createRef<Layout>();
  const trail3 = createRef<Layout>();
  const dot = createRef<Rect>();
  const thankYou = createRef<Txt>();

  view.add(
    <>
      <Node
        ref={logo}
        rotation={-45}
        position={44}
        scale={0.8}
        opacity={0}
        cache
      >
        <Node cache y={-270}>
          <Trail ref={trail1}>
            {range(3).map((_) => (
              <Rect width={40} radius={20} height={120} fill={YELLOW} />
            ))}
          </Trail>
          <Rect
            width={40}
            radius={20}
            height={270}
            fill={'white'}
            offsetY={-1}
            compositeOperation={'destination-in'}
          />
        </Node>
        <Node cache x={-70} y={-200}>
          <Trail ref={trail2}>
            {range(3).map((_) => (
              <Rect width={40} height={120} radius={20} fill={RED} />
            ))}
          </Trail>
          <Rect
            width={40}
            radius={20}
            height={180}
            fill={'white'}
            offsetY={-1}
            compositeOperation={'destination-in'}
          />
        </Node>
        <Node cache x={70} y={-300}>
          <Trail ref={trail3}>
            {range(4).map((i) => (
              <Rect
                ref={i === 1 ? dot : undefined}
                width={40}
                radius={20}
                height={100}
                fill={i === 0 ? GREEN : BLUE}
                offsetY={1}
              />
            ))}
          </Trail>
          <Rect
            width={40}
            radius={20}
            height={220}
            fill={'white'}
            offsetY={-1}
            y={60}
            compositeOperation={'destination-in'}
          />
        </Node>
        <Node ref={star}>
          {range(5).map((i) => (
            <Rect
              width={100}
              radius={50}
              height={150}
              fill={'white'}
              offsetY={1}
              rotation={(360 / 5) * i}
              compositeOperation={'destination-out'}
            />
          ))}
          {range(5).map((i) => (
            <Rect
              width={40}
              radius={20}
              height={120}
              fill={'white'}
              offsetY={1}
              rotation={(360 / 5) * i}
            />
          ))}
        </Node>
      </Node>

      <Txt
        ref={thankYou}
        fontSize={92}
        fill={theme.colors.White}
        fontFamily={theme.fonts.serif}
        text={'Thank you for watching!'}
        opacity={0}
      />
    </>,
  );

  yield* slideTransition();

  yield loop(Infinity, () =>
    all(
      star().rotation(0, 0).to(360, 4, linear),
      loop(4, function* () {
        yield* trail1().position.y(-150, 1, linear);
        trail1().position.y(0);
      }),
      loop(2, function* () {
        yield* trail2().position.y(-150, 2, linear);
        trail2().position.y(0);
      }),
      loop(2, function* () {
        yield* all(
          trail3().position.y(-130, 2, linear),
          dot().fill(GREEN, 2, linear),
        );
        dot().fill(BLUE);
        trail3().position.y(0);
      }),
    ),
  );

  yield* waitUntil('show logo');
  yield* logo().opacity(1, 2);

  yield* waitUntil('fade logo');
  yield* logo().opacity(0, 1);

  yield* waitUntil('fade text');
  yield* thankYou().opacity(1, 0.5);

  yield* waitUntil('scene end');
});
