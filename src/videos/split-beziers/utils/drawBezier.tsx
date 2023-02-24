import {
  Circle,
  CircleProps,
  Layout,
  Line,
  LineProps,
  Text,
  TextProps,
} from '@motion-canvas/2d/lib/components';
import { Vector2, Vector2Signal } from '@motion-canvas/core/lib/types';
import { RefsProperty, makeRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { CubicBezier } from '../components/CubicBezier';

export const bezierControlPoints = [
  Vector2.createSignal([-500, 200]),
  Vector2.createSignal([500, -120]),
  Vector2.createSignal([100, -200]),
  Vector2.createSignal([300, 300]),
];

const pointStyles: CircleProps = {
  width: 18,
  height: 18,
  stroke: theme.colors.White,
  fill: theme.colors.Gray5,
  lineWidth: 3,
};

const handleStyles: CircleProps = {
  width: 18,
  height: 18,
  lineWidth: 3,
  stroke: theme.colors.White,
  fill: theme.colors.Gray5,
};

const pointLabelStyles: TextProps = {
  fontFamily: theme.fonts.pixelBody,
  fill: theme.colors.White,
  fontSize: 42,
};

const lineStyles: LineProps = {
  lineWidth: 1.5,
  stroke: theme.colors.White,
};

function makeControlPointText(index: number): string {
  // There's probably a better way to figure this out, but I
  // really cannot be bothered right now.
  switch (index) {
    case 0:
      return 'p0';
    case 1:
      return 'p3';
    case 2:
      return 'p1';
    case 3:
      return 'p2';
    default:
      throw new Error('bby what is u doin');
  }
}

export function makeBezierRefs(): RefsProperty<typeof Bezier> {
  return {
    container: null,
    curve: null,
    controlPoints: [],
    lines: [],
    pointLabels: [],
  };
}

export const ControlPoint = (props: CircleProps) => (
  <Circle {...handleStyles} {...props} />
);

export function Bezier({
  points = bezierControlPoints,
  showCurve = true,
  showPoints = false,
  showLabels = false,
  showLines = false,
  drawAllLines = false,
  refs,
}: {
  points?: Vector2Signal<void>[];
  showCurve?: boolean;
  showPoints?: boolean;
  showLines?: boolean;
  showLabels?: boolean;
  drawAllLines?: boolean;
  refs: {
    container: Layout;
    curve: CubicBezier;
    controlPoints: Circle[];
    pointLabels: Text[];
    lines: Line[];
  };
}) {
  return (
    <Layout ref={makeRef(refs, 'container')}>
      <CubicBezier
        ref={makeRef(refs, 'curve')}
        from={points[0]}
        fromHandle={points[2]}
        toHandle={points[3]}
        to={points[1]}
        lineWidth={8}
        end={showCurve ? 1 : 0}
        stroke={theme.colors.White}
      />

      <Line
        ref={makeRef(refs['lines'], 0)}
        points={[points[0], points[2]]}
        end={showLines ? 1 : 0}
        {...lineStyles}
      />

      <Line
        ref={makeRef(refs['lines'], 2)}
        points={[points[2], points[3]]}
        end={drawAllLines ? 1 : 0}
        {...lineStyles}
      />

      <Line
        ref={makeRef(refs['lines'], 1)}
        points={[points[1], points[3]]}
        end={showLines ? 1 : 0}
        {...lineStyles}
      />

      {...points.map((point, i) => (
        <>
          <Circle
            ref={makeRef(refs['controlPoints'], i)}
            scale={showPoints ? 1 : 0}
            position={points[i]}
            {...(i < 2 ? pointStyles : handleStyles)}
          />

          <Text
            ref={makeRef(refs['pointLabels'], i)}
            text={makeControlPointText(i)}
            position={() => points[i]().sub(new Vector2(-40, -20))}
            scale={showLabels ? 1 : 0}
            {...pointLabelStyles}
          />
        </>
      ))}
    </Layout>
  );
}
