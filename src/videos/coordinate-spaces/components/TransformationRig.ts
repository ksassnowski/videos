import { Layout, Shape, ShapeProps } from '@motion-canvas/2d/lib/components';
import { computed, initial, signal } from '@motion-canvas/2d/lib/decorators';
import { spacingSignal } from '@motion-canvas/2d/lib/decorators/spacingSignal';
import { arc, drawRect, lineTo, moveTo } from '@motion-canvas/2d/lib/utils';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import {
  BBox,
  Matrix2D,
  PossibleSpacing,
  SpacingSignal,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';

export interface TransformationRigProps extends ShapeProps {
  handleSize?: SignalValue<number>;
  node?: SignalValue<Layout>;
  spacing?: SignalValue<PossibleSpacing>;
}

export enum Control {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
  Rotation,
}

export class TransformationRig extends Shape {
  @initial(10)
  @signal()
  public declare readonly handleSize: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly node: SimpleSignal<Layout, this>;

  @spacingSignal('spacing')
  public declare readonly spacing: SpacingSignal<this>;

  public constructor(props: TransformationRigProps) {
    super(props);
  }

  public control(control: Control): Vector2 {
    let position: Vector2;

    switch (control) {
      case Control.TopLeft:
        position = this.bbox().corners[0];
        break;
      case Control.TopRight:
        position = this.bbox().corners[1];
        break;
      case Control.BottomRight:
        position = this.bbox().corners[2];
        break;
      case Control.BottomLeft:
        position = this.bbox().corners[3];
        break;
      case Control.Rotation:
        position = this.bbox().corners[0].add(
          new Vector2(this.bbox().width / 2, -50),
        );
        break;
    }

    return position.transformAsPoint(
      this.rotationMatrix(this.bbox().center, this.node().rotation()).domMatrix,
    );
  }

  @computed()
  public bbox(): BBox {
    const node = this.node();

    if (!node) {
      return new BBox();
    }

    return node
      .cacheBBox()
      .transform(
        node
          .localToWorld()
          .multiply(
            this.rotationMatrix(node.cacheBBox().center, -node.rotation())
              .domMatrix,
          ),
      )
      .transform(this.worldToLocal())
      .addSpacing(this.spacing());
  }

  protected override drawShape(context: CanvasRenderingContext2D) {
    const node = this.node();
    if (!node) {
      return;
    }

    context.save();
    this.applyStyle(context);
    this.drawRipple(context);

    const bbox = this.bbox();
    const handleSize = this.handleSize();
    const matrix = this.rotationMatrix(bbox.center, node.rotation()).domMatrix;
    context.transform(
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e,
      matrix.f,
    );

    // Draw border
    drawRect(context, bbox);
    context.stroke();

    // Draw scaling handles
    for (const corner of bbox.corners) {
      context.beginPath();
      drawRect(
        context,
        new BBox(corner.sub(handleSize / 2), new Vector2(handleSize)),
      );
      context.fill();
      context.stroke();
    }

    // Draw rotation handle path
    const lineStart = bbox.corners[0].lerp(bbox.corners[1], 0.5);
    const circleCenter = lineStart.add(Vector2.down.scale(50));
    const circleRadius = handleSize / 2;

    moveTo(context, lineStart);
    lineTo(context, circleCenter.add(Vector2.up.scale(circleRadius)));
    context.stroke();

    // Draw rotation handle
    moveTo(context, circleCenter);
    context.beginPath();
    arc(context, circleCenter, circleRadius);
    context.fill();
    context.stroke();

    context.restore();
  }

  private rotationMatrix(pivot: Vector2, angle: number): Matrix2D {
    const theta = (angle * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    return new Matrix2D(
      cos,
      sin,
      -sin,
      cos,
      pivot.x - pivot.x * cos + pivot.y * sin,
      pivot.y - pivot.y * cos - pivot.x * sin,
    );
  }
}
