import {
  Grid,
  GridProps,
  Line,
  Node,
  Shape,
} from '@motion-canvas/2d/lib/components';
import { initial, signal } from '@motion-canvas/2d/lib/decorators';
import { lineTo, moveTo } from '@motion-canvas/2d/lib/utils';
import {
  SignalValue,
  SimpleSignal,
  isReactive,
} from '@motion-canvas/core/lib/signals';
import { Vector2 } from '@motion-canvas/core/lib/types';

export interface CoordinateSpaceProps extends GridProps {
  node: SignalValue<Node>;
}

export class CoordinateSpace extends Grid {
  @initial(null)
  @signal()
  public declare readonly node: SimpleSignal<Node, this>;

  public constructor(props: CoordinateSpaceProps) {
    const node = isReactive(props.node) ? props.node() : props.node;
    super({
      spacing: () => node.scale().scale(50),
      position: () =>
        node.absolutePosition().transformAsPoint(this.worldToParent()),
      rotation: () => node.absoluteRotation(),
      lineWidth: 1,
      width: 4000,
      height: 4000,
      opacity: 0.8,
      ...props,
    });
  }

  protected override drawShape(context: CanvasRenderingContext2D) {
    super.drawShape(context);

    context.save();
    this.applyStyle(context);

    context.lineWidth = 3;
    const size = this.computedSize().scale(0.5);

    context.beginPath();
    moveTo(context, new Vector2(0, size.y));
    lineTo(context, new Vector2(0, -size.y));
    context.stroke();

    context.beginPath();
    moveTo(context, new Vector2(size.x, 0));
    lineTo(context, new Vector2(-size.x, 0));
    context.stroke();

    context.restore();
  }
}
