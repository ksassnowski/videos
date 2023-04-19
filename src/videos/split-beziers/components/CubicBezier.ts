import { Shape, ShapeProps } from '@motion-canvas/2d/lib/components';
import { CurvePoint } from '@motion-canvas/2d/lib/curves';
import {
  computed,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { arc, drawLine, lineTo, moveTo } from '@motion-canvas/2d/lib/utils';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import {
  BBox,
  PossibleVector2,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';

import { BezierCubic2D } from '@common/utils/BezierCubic2D';

export interface CubicBezierProps extends ShapeProps {
  from: SignalValue<PossibleVector2>;
  fromHandle: SignalValue<PossibleVector2>;
  toHandle: SignalValue<PossibleVector2>;
  to: SignalValue<PossibleVector2>;
  start?: SignalValue<number>;
  end?: SignalValue<number>;
}

export class CubicBezier extends Shape {
  @vector2Signal('from')
  public declare readonly from: Vector2Signal<this>;

  @vector2Signal('fromHandle')
  public declare readonly fromHandle: Vector2Signal<this>;

  @vector2Signal('toHandle')
  public declare readonly toHandle: Vector2Signal<this>;

  @vector2Signal('to')
  public declare readonly to: Vector2Signal<this>;

  @initial(0)
  @signal()
  public declare readonly start: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;

  constructor(props: CubicBezierProps) {
    super(props);
  }

  @computed()
  public curve(): BezierCubic2D {
    return new BezierCubic2D(
      this.from(),
      this.fromHandle(),
      this.toHandle(),
      this.to(),
    );
  }

  @computed()
  public points(): [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ] {
    return [
      this.from().x,
      this.from().y,
      this.fromHandle().x,
      this.fromHandle().y,
      this.toHandle().x,
      this.toHandle().y,
      this.to().x,
      this.to().y,
    ];
  }

  public getPointAtPercentage(t: number): CurvePoint {
    return this.curve().eval(t);
  }

  public override drawOverlay(
    context: CanvasRenderingContext2D,
    matrix: DOMMatrix,
  ): void {
    const rect = this.getCacheRect().transformCorners(matrix);
    const size = this.computedSize();
    const offset = size.mul(this.offset()).scale(0.5).transformAsPoint(matrix);

    const points = [
      this.from(),
      this.fromHandle(),
      this.toHandle(),
      this.to(),
    ].map((point) => point.transformAsPoint(matrix));

    context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.fillStyle = 'white';
    context.globalAlpha = 0.5;

    const lines = new Path2D();
    moveTo(lines, points[0]);
    lineTo(lines, points[1]);
    moveTo(lines, points[2]);
    lineTo(lines, points[3]);
    context.beginPath();
    context.stroke(lines);

    context.globalAlpha = 1;
    context.lineWidth = 2;

    for (const point of [points[0], points[3]]) {
      moveTo(context, point);
      context.beginPath();
      arc(context, point, 4);
      context.closePath();
      context.fill();
      context.stroke();
    }

    context.fillStyle = 'black';
    for (const point of [points[1], points[2]]) {
      moveTo(context, point);
      context.beginPath();
      arc(context, point, 4);
      context.closePath();
      context.fill();
      context.stroke();
    }

    context.lineWidth = 1;

    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    path.bezierCurveTo(
      points[1].x,
      points[1].y,
      points[2].x,
      points[2].y,
      points[3].x,
      points[3].y,
    );
    context.stroke(path);

    const radius = 8;
    context.beginPath();
    lineTo(context, offset.addY(-radius));
    lineTo(context, offset.addY(radius));
    lineTo(context, offset);
    lineTo(context, offset.addX(-radius));
    context.arc(offset.x, offset.y, radius, 0, Math.PI * 2);
    context.stroke();

    context.beginPath();
    drawLine(context, rect);
    context.closePath();
    context.stroke();
  }

  protected override getPath(): Path2D {
    const path = new Path2D();
    const [, startSegment] = this.curve().split(this.start());
    const [segment] = startSegment.split(this.end());

    moveTo(path, segment.p0);

    path.bezierCurveTo(
      segment.p1.x,
      segment.p1.y,
      segment.p2.x,
      segment.p2.y,
      segment.p3.x,
      segment.p3.y,
    );
    return path;
  }

  protected override getCacheRect(): BBox {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = this.points();

    const tvalues: number[] = [];
    const xvalues: number[] = [];
    const yvalues: number[] = [];
    let a, b, c, t, t1, t2, b2ac, sqrtb2ac;

    for (var i = 0; i < 2; ++i) {
      if (i == 0) {
        b = 6 * x0 - 12 * x1 + 6 * x2;
        a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
        c = 3 * x1 - 3 * x0;
      } else {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }
      if (Math.abs(a) < 1e-12) {
        if (Math.abs(b) < 1e-12) {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tvalues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
        if (Math.abs(b2ac) < 1e-12) {
          t = -b / (2 * a);
          if (0 < t && t < 1) {
            tvalues.push(t);
          }
        }
        continue;
      }
      sqrtb2ac = Math.sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tvalues.push(t2);
      }
    }

    var j = tvalues.length,
      mt;
    while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      xvalues[j] =
        mt * mt * mt * x0 +
        3 * mt * mt * t * x1 +
        3 * mt * t * t * x2 +
        t * t * t * x3;
      yvalues[j] =
        mt * mt * mt * y0 +
        3 * mt * mt * t * y1 +
        3 * mt * t * t * y2 +
        t * t * t * y3;
    }

    xvalues.push(x0, x3);
    yvalues.push(y0, y3);

    return BBox.fromPoints(
      new Vector2(
        Math.min.apply(0, xvalues) - this.lineWidth(),
        Math.min.apply(0, yvalues) - this.lineWidth(),
      ),
      new Vector2(
        Math.max.apply(0, xvalues) + this.lineWidth(),
        Math.max.apply(0, yvalues) + this.lineWidth(),
      ),
    );
  }
}
