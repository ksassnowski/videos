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
  start?: SignalValue<number>;
  end?: SignalValue<number>;
  axisStart?: SignalValue<number>;
  axisEnd?: SignalValue<number>;
}

export class Grid extends Shape {
  @initial(80)
  @vector2Signal('spacing')
  public declare readonly spacing: Vector2Signal<this>;

  @initial(true)
  @signal()
  public declare readonly drawAxis: SimpleSignal<boolean, this>;

  @initial(0)
  @signal()
  public declare readonly start: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly end: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly axisStart: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly axisEnd: SimpleSignal<number, this>;

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
    const start = this.start();
    const end = this.end();
    const size = this.computedSize().scale(0.5);
    const steps = size.div(spacing).floored;

    for (let x = -steps.x; x <= steps.x; x++) {
      const [from, to] = this.mapPoints(-size.height, size.height);

      context.beginPath();
      context.moveTo(spacing.x * x, from);
      context.lineTo(spacing.x * x, to);
      context.stroke();
    }

    for (let y = -steps.y; y <= steps.y; y++) {
      const [from, to] = this.mapPoints(-size.width, size.width);

      context.beginPath();
      context.moveTo(from, spacing.y * y);
      context.lineTo(to, spacing.y * y);
      context.stroke();
    }

    if (drawAxis) {
      context.lineWidth = this.axisLineWidth();
      context.strokeStyle = resolveCanvasStyle(this.axisStroke(), context);
      const start = this.axisStart();
      const end = this.axisEnd();

      let from = map(-size.height, size.height, start);
      let to = map(-size.height, size.height, end);

      if (to < from) {
        [from, to] = [to, from];
      }

      this.drawLine(context, 0, from, 0, to);

      from = map(-size.width, size.width, start);
      to = map(-size.width, size.width, end);

      if (to < from) {
        [from, to] = [to, from];
      }

      this.drawLine(context, from, 0, to, 0);
    }

    context.restore();
  }

  private getDefaultAxisStart() {
    return this.start();
  }

  private getDefaultAxisEnd() {
    return this.end();
  }

  private mapPoints(start: number, end: number): [number, number] {
    let from = map(start, end, this.start());
    let to = map(start, end, this.end());

    if (to < from) {
      [from, to] = [to, from];
    }

    return [from, to];
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
