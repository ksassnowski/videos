import { Shape, ShapeProps } from '@motion-canvas/2d/lib/components';
import {
  CanvasStyleSignal,
  canvasStyleSignal,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { PossibleCanvasStyle } from '@motion-canvas/2d/lib/partials';
import { resolveCanvasStyle } from '@motion-canvas/2d/lib/utils';
import { map } from '@motion-canvas/core';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { PossibleVector2, Vector2Signal } from '@motion-canvas/core/lib/types';

export interface GridProps extends ShapeProps {
  spacing?: SignalValue<PossibleVector2>;
  drawAxis?: SignalValue<boolean>;
  axisLineWidth?: SignalValue<number>;
  axisStroke?: SignalValue<PossibleCanvasStyle>;
  end?: SignalValue<number>;
}

export class Grid extends Shape {
  @initial(80)
  @vector2Signal('spacing')
  public declare readonly spacing: Vector2Signal<this>;

  @initial(true)
  @signal()
  public declare readonly drawAxis: SimpleSignal<boolean, this>;

  @initial(1)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;

  @initial(3)
  @signal()
  public declare readonly axisLineWidth: SimpleSignal<number, this>;

  @canvasStyleSignal()
  public declare readonly axisStroke: CanvasStyleSignal<this>;

  public constructor(props: GridProps) {
    super(props);
  }

  protected override drawShape(context: CanvasRenderingContext2D) {
    context.save();
    this.applyStyle(context);
    this.drawRipple(context);

    const spacing = this.spacing();
    const drawAxis = this.drawAxis();
    const end = this.end();
    const size = this.computedSize().scale(0.5);
    const steps = size.div(spacing).floored;

    for (let x = -steps.x; x <= steps.x; x++) {
      const to = map(-size.height, size.height, end);
      this.drawLine(context, spacing.x * x, -size.height, spacing.x * x, to);
    }

    for (let y = -steps.y; y <= steps.y; y++) {
      const to = map(-size.width, size.width, end);
      this.drawLine(context, -size.width, spacing.y * y, to, spacing.y * y);
    }

    if (drawAxis) {
      context.lineWidth = this.axisLineWidth();
      context.strokeStyle = resolveCanvasStyle(this.axisStroke(), context);

      this.drawLine(
        context,
        0,
        size.height,
        0,
        map(size.height, -size.height, end),
      );
      this.drawLine(
        context,
        -size.width,
        0,
        map(-size.width, size.width, end),
        0,
      );
    }

    context.restore();
  }

  private drawLine(
    context: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) {
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  }
}
