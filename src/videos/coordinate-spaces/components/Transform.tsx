import { LayoutProps, Node, Shape } from '@motion-canvas/2d/lib/components';
import { colorSignal, initial, signal } from '@motion-canvas/2d/lib/decorators';
import { lineTo, moveTo } from '@motion-canvas/2d/lib/utils';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import {
  Color,
  ColorSignal,
  Matrix2D,
  PossibleColor,
  Vector2,
} from '@motion-canvas/core/lib/types';

import theme from '@theme';

export interface TransformProps extends LayoutProps {
  node?: SignalValue<Node>;
  end?: SignalValue<number>;
  arrowSize?: SignalValue<number>;
  axisLength?: SignalValue<number>;
  xColor?: SignalValue<PossibleColor>;
  yColor?: SignalValue<PossibleColor>;
}

export class Transform extends Shape {
  @initial(null)
  @signal()
  public declare readonly node: SimpleSignal<Node | null, this>;

  @initial(8)
  @signal()
  public declare readonly arrowSize: SimpleSignal<number, this>;

  @initial(50)
  @signal()
  public declare readonly axisLength: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;

  @initial(theme.colors.Red)
  @colorSignal()
  public declare readonly xColor: ColorSignal<this>;

  @initial(theme.colors.Green1)
  @colorSignal()
  public declare readonly yColor: ColorSignal<this>;

  public constructor(props: TransformProps) {
    super({
      lineWidth: 5,
      ...props,
    });

    if (this.node()) {
      this.absolutePosition(() => this.node().absolutePosition());
    }
  }

  protected override drawShape(context: CanvasRenderingContext2D) {
    context.save();
    this.applyStyle(context);
    this.drawRipple(context);

    const end = this.end();
    if (end === 0) {
      return;
    }

    const node = this.node();
    const matrix = node
      ? this.worldToLocal().multiply(node.localToWorld())
      : Matrix2D.identity.domMatrix;
    const arrowSize = this.arrowSize();
    const axisLength = this.axisLength();
    const arrows: [Vector2, Color][] = [
      [Vector2.right, this.xColor()],
      [Vector2.up, this.yColor()],
    ];

    context.lineCap = 'round';

    for (let [direction, color] of arrows) {
      context.strokeStyle = color.css();
      context.fillStyle = color.css();
      context.beginPath();

      direction = direction.transformAsPoint(matrix);
      const lineEnd = direction.scale(axisLength - arrowSize / 2).scale(end);
      const tangent = direction.flipped.normalized;

      moveTo(context, Vector2.zero);
      lineTo(context, lineEnd);

      const realArrowSize = Math.min(lineEnd.magnitude / 2, arrowSize);
      if (realArrowSize >= 0.0001) {
        this.drawArrow(context, lineEnd, tangent, realArrowSize);
      }

      context.stroke();
      context.fill();
    }

    context.restore();
  }

  private drawArrow(
    context: CanvasRenderingContext2D | Path2D,
    center: Vector2,
    tangent: Vector2,
    arrowSize: number,
  ) {
    const normal = tangent.perpendicular;
    const origin = center.add(tangent.scale(-arrowSize / 2));

    moveTo(context, origin);
    lineTo(context, origin.add(tangent.add(normal).scale(arrowSize)));
    lineTo(context, origin.add(tangent.sub(normal).scale(arrowSize)));
    lineTo(context, origin);
    context.closePath();
  }
}
