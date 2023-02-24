import { makeScene2D } from "@motion-canvas/2d";
import { Rect, Text, TextProps } from "@motion-canvas/2d/lib/components";
import {
  CodeBlock,
  edit,
  insert,
  lines,
  remove,
} from "@motion-canvas/2d/lib/components/CodeBlock";
import {
  all,
  delay,
  sequence,
  waitFor,
  waitUntil,
} from "@motion-canvas/core/lib/flow";
import { createSignal } from "@motion-canvas/core/lib/signals";
import {
  createEaseOutBounce,
  easeOutBack,
} from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import {
  RefsProperty,
  createRef,
  useScene,
} from "@motion-canvas/core/lib/utils";

import { Bezier } from "../utils/drawBezier";

export default makeScene2D(function* (view) {
  const bezier: RefsProperty<typeof Bezier> = {
    container: null,
    curve: null,
    controlPoints: [],
    lines: [],
    pointLabels: [],
  };
  const codeRect = createRef<Rect>();
  const code = createRef<CodeBlock>();
  const tStartText = createRef<Text>();
  const tEndText = createRef<Text>();

  const tTextStyles: TextProps = {
    fontFamily: "Monogram",
    fontSize: 82,
    fill: "whitesmoke",
    offset: [-1, 0],
    width: 700,
  };

  // The wonky order makes it easier to loop over in the animation
  const points = [
    // From
    Vector2.createSignal([-500, 200]),
    // To
    Vector2.createSignal([500, -120]),
    // Start handle
    Vector2.createSignal([100, -200]),
    // End handle
    Vector2.createSignal([300, 300]),
  ];

  yield view.add(<Bezier refs={bezier} points={points} />);

  yield* bezier.curve.end(0, 0).to(1, 1.4);

  yield* waitUntil("draw-points");
  yield* all(
    sequence(
      0.15,
      ...bezier.controlPoints.map((point) =>
        point.scale(1, 0.5, createEaseOutBounce(8, 2)),
      ),
      delay(
        0.11,
        sequence(0.1, ...bezier.lines.map((line) => line.end(1, 0.4))),
      ),
      delay(
        0.11,
        sequence(
          0.1,
          ...bezier.pointLabels.map((label) =>
            label.scale(1, 0.4, easeOutBack),
          ),
        ),
      ),
    ),
  );

  yield* waitUntil("remove-labels");
  yield* all(...bezier.pointLabels.map((label) => label.opacity(0, 0.3)));

  yield* waitUntil("line-gymnastics");
  yield* all(
    points[1].x(500, 1),
    points[1].y(200, 1),
    points[2].x(-300, 1),
    points[2].y(-100, 1),
    points[3].x(300, 1),
    points[3].y(-100, 1),
  );
  yield* all(points[2].x(700, 1), points[3].x(-700, 1));
  yield* all(
    points[0].x(500, 1),
    points[0].y(-200, 1),
    points[2].x(200, 1),
    points[2].y(400, 1),
    points[3].x(200, 1),
    points[3].y(-400, 1),
  );

  yield* all(
    points[0].x(500, 1),
    points[0].y(1000, 1),
    points[1].x(-1900, 1),
    points[1].y(0, 1),
    points[2].x(0, 1),
    points[2].y(0, 1),
    points[3].x(2000, 1),
    points[3].y(-200, 1),
  );

  yield* waitUntil("line-reset");
  yield* all(
    points[0].x(-500, 1),
    points[0].y(200, 1),
    points[1].x(500, 1),
    points[1].y(-120, 1),
    points[2].x(100, 1),
    points[2].y(-200, 1),
    points[3].x(300, 1),
    points[3].y(300, 1),
  );

  yield* waitUntil("show-code");
  yield view.add(
    <Rect
      ref={codeRect}
      fill={"#000000bb"}
      padding={[26, 52, 20, 52]}
      position={[-570, 0]}
      radius={14}
      opacity={0}
      smoothCorners
      layout
    >
      <CodeBlock
        ref={code}
        fontFamily={"Monogram"}
        fontSize={52}
        lineHeight={52 * 1.2}
        code={`context.bezierCurveTo(
  p0.x, p0.y,
  p1.x, p1.y,
  p2.x, p2.y,
  p3.x, p3.y,
)`}
      />
    </Rect>,
  );

  yield* all(
    codeRect().position.y(-60, 0),
    sequence(
      0.1,
      bezier.container.position.x(300, 1),
      all(...bezier.pointLabels.map((label) => label.opacity(1, 0.6))),
      all(codeRect().opacity(1, 1), codeRect().position.y(0, 1)),
    ),
  );

  yield* waitUntil("highlight-points");
  yield* all(...bezier.controlPoints.map((point) => point.scale(2.5, 0.5)));

  yield* waitUntil("unhighlight-points");
  yield* all(...bezier.controlPoints.map((point) => point.scale(1, 0.5)));

  yield* waitUntil("draw-line");
  yield* bezier.curve.end(0, 0).to(1, 2);

  yield* waitUntil("draw-line-again");
  yield* bezier.curve.end(0, 0).to(1, 2);

  yield* waitUntil("animate-line");
  yield* bezier.curve.end(0.2, 1.2);
  yield* all(bezier.curve.start(0.8, 1.2), bezier.curve.end(1, 1.2));
  yield* all(bezier.curve.start(0, 1.2), bezier.curve.end(0.2, 1.2));
  yield* bezier.curve.end(1, 1);

  yield* waitUntil("draw-part-1");
  yield* bezier.curve.end(0.5, 1);
  yield* waitUntil("draw-part-2");
  yield* bezier.curve.end(0.2, 1);
  yield* waitUntil("draw-none");
  yield* bezier.curve.end(0, 1);

  yield* waitUntil("draw-line-yet-again");
  yield* bezier.curve.end(0, 0).to(1, 2);

  yield* waitUntil("hide-line");
  yield* bezier.curve.end(0, 0.5);

  yield* waitUntil("draw-segements");
  for (let i = 0.05; i <= 1 + 0.01; i += 0.05) {
    yield* bezier.curve.end(i, 0.1);
    yield* waitFor(0.1);
  }

  yield* waitUntil("draw-full");
  yield* bezier.curve.end(0, 0.5).to(1, 2);

  yield* waitUntil("show-t-end");
  yield* code().edit(1.2)`context.bezierCurveTo(
  p0.x, p0.y,
  p1.x, p1.y,
  p2.x, p2.y,
  p3.x, p3.y,${insert(`
  t,`)}
)`;

  const tEnd = createSignal(1);
  const tStart = createSignal(0);
  bezier.curve.end(tEnd);
  bezier.curve.start(tStart);

  yield* waitUntil("show-t-counter");
  view.add(
    <Text
      ref={tEndText}
      text={() => `t = ${tEnd().toFixed(2)}`}
      position={[110, 200]}
      {...tTextStyles}
    />,
  );
  yield* tEndText().opacity(0, 0).to(1, 1);

  yield* waitUntil("animate-t-end");
  yield* tEnd(0.8, 1).to(0.4, 1).to(0.23, 1).to(1, 1).to(0, 1);

  yield* waitUntil("t-formula");
  yield* tEndText().opacity(0, 0.5);
  tEndText().text(
    () => `t = ${(2 * tEnd()).toFixed(2)} / 2.00 = ${tEnd().toFixed(2)}`,
  );
  tEndText().position.x(-80);
  yield* tEndText().opacity(1, 0.5);

  yield* waitUntil("animate-calculate-t");
  yield* tEnd(1, 2);

  yield* waitUntil("reset-t-end");
  yield* tEndText().opacity(0, 0.5);
  tEndText().text(() => `t = ${tEnd().toFixed(2)}`);
  tEndText().position.x(110);
  yield* tEndText().opacity(1, 0.5);

  yield* waitUntil("animate-calculate-t-2");
  yield* tEnd(0.2, 1).to(0.8, 1).to(0.5, 1).to(1, 1);

  yield* waitUntil("show-t-start");
  yield* tEndText().opacity(0, 1);
  view.add(
    <Text
      ref={tStartText}
      text={() => `tStart = ${tStart().toFixed(2)}`}
      position={[50, 240]}
      opacity={0}
      {...tTextStyles}
    />,
  );

  tEndText().text(() => `tEnd   = ${tEnd().toFixed(2)}`);
  tEndText().position([50, 170]);
  yield* all(
    code().edit(1.2)`context.bezierCurveTo(
  p0.x, p0.y,
  p1.x, p1.y,
  p2.x, p2.y,
  p3.x, p3.y,
  ${edit(
    `t,`,
    `tStart,
  tEnd,`,
  )}
)`,
  );

  yield* waitUntil("show-t-values");
  yield* all(
    tStartText().opacity(0, 0).to(1, 0.8),
    tEndText().opacity(0, 0).to(1, 0.8),
  );

  yield* waitUntil("animate-t");
  bezier.curve.end(tEnd);
  yield* all(
    tEnd(0.8, 1).to(0.4, 1).to(0.23, 1).to(0.6, 1).to(1, 1),
    tStart(0.4, 1).to(0.2, 1).to(0, 1).to(0.2, 1).to(0, 1),
  );

  yield* waitUntil("reset-t");
  yield* all(
    code().selection(lines(0, Infinity), 1),
    code().edit(1.5, false)`context.bezierCurveTo(
  p0.x, p0.y,
  p1.x, p1.y,
  p2.x, p2.y,
  p3.x, p3.y,${remove(`
  tStart,
  tEnd,`)}
)`,
    tStartText().opacity(0, 1),
    tEndText().opacity(0, 1),
  );

  useScene().canTransitionOut();
});
