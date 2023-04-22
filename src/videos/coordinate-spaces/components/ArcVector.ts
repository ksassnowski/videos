import { Circle, CircleProps } from '@motion-canvas/2d/lib/components';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import {
  arc,
  lineTo,
  moveTo,
  resolveCanvasStyle,
} from '@motion-canvas/2d/lib/utils';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { Vector2 } from '@motion-canvas/core/lib/types';

export interface ArcVectorProps extends CircleProps {
  arrowSize?: SignalValue<number>;
  counter?: SignalValue<boolean>;
}

export class ArcVector extends Circle {
  @initial(16)
  @signal()
  public declare readonly arrowSize: SimpleSignal<number, this>;

  @initial(false)
  @signal()
  public declare readonly counter: SimpleSignal<boolean, this>;

  public constructor(props: ArcVectorProps) {
    super(props);
  }

  protected override drawShape(context: CanvasRenderingContext2D): void {
    const counter = this.counter();
    const radius = this.size().x / 2;
    let startAngle = (this.startAngle() * Math.PI) / 180;
    let endAngle = (this.endAngle() * Math.PI) / 180;

    if (counter) {
      startAngle *= -1;
      endAngle *= -1;
    }

    this.applyStyle(context);
    context.beginPath();
    arc(context, this.position(), radius, startAngle, endAngle, counter);
    context.stroke();

    const arcLength = Math.abs(startAngle - endAngle) * radius;

    if (arcLength < 0.00001) {
      return;
    }

    const arrowSize = this.arrowSize();

    const normal = Vector2.fromRadians(endAngle).normalized;
    const position = normal.scale(radius);
    const tangent = counter
      ? normal.perpendicular
      : normal.flipped.perpendicular;
    const origin = position.add(tangent.scale(arrowSize / 2));

    context.save();
    context.fillStyle = resolveCanvasStyle(this.stroke(), context);

    context.beginPath();
    moveTo(context, origin);
    lineTo(context, origin.add(tangent.flipped.add(normal).scale(arrowSize)));
    lineTo(context, origin.add(tangent.flipped.sub(normal).scale(arrowSize)));
    context.closePath();

    context.fill();
    context.restore();
  }
}
