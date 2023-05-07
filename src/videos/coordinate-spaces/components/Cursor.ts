import { Img, Node, ShapeProps } from '@motion-canvas/2d/lib/components';
import { Curve } from '@motion-canvas/2d/lib/components/Curve';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import {
  SignalValue,
  createComputed,
  createSignal,
} from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import { PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';

import { translate } from '@common/utils/translate';

import cursorImage from '../assets/cursor.svg';

export interface DragConfig {
  nodeScale: number;
  ghostScale: number;
  ghostOpacity: number;
  dragPivot?: Node;
  dragOffset?: PossibleVector2;
}

interface DragPayload {
  config: DragConfig;
  clickOffset: Vector2;
  cursorTipOffset: Vector2;
}

interface DragCallback {
  (payload: DragPayload): ThreadGenerator;
}

export class Cursor extends Img {
  public get cursorTipOffset(): Vector2 {
    return new Vector2(-50, -50);
  }

  public constructor(props: ShapeProps) {
    super({ size: 90, ...props, src: cursorImage });
  }

  public moveToPosition(
    position: PossibleVector2 | Node,
    duration: number,
  ): ThreadGenerator {
    let to: Vector2;

    if (position instanceof Node) {
      to = position.absolutePosition();
    } else {
      to = new Vector2(position);
    }

    return this.absolutePosition(to.sub(this.cursorTipOffset), duration);
  }

  public stickTo(position: () => Vector2) {
    this.absolutePosition(() => position().sub(this.cursorTipOffset));
  }

  public unstick(): void {
    this.absolutePosition(this.absolutePosition());
  }

  public show(duration = 0.6): ThreadGenerator {
    return this.scale(1, duration, easeOutBack);
  }

  public hide(duration = 0.6): ThreadGenerator {
    return this.scale(0, duration, easeInBack);
  }

  public *clickAndDrag(
    node: Node,
    to: PossibleVector2[],
    duration: number,
    config?: Partial<DragConfig>,
  ): ThreadGenerator {
    function* callback({ config, cursorTipOffset, clickOffset }: DragPayload) {
      const destinations = to.map((point) => new Vector2(point));

      for (const destination of destinations) {
        const transformedDestination = destination.transformAsPoint(
          this.view2D.localToWorld(),
        );
        yield* all(
          this.absolutePosition(
            transformedDestination
              .sub(cursorTipOffset)
              .add(clickOffset)
              .add(config.dragOffset),
            duration,
          ),
          node.absolutePosition(transformedDestination, duration),
        );
        yield* waitFor(0.1);
      }
    }

    yield* this.drag(node, config, callback.bind(this));
  }

  public *clickAndDragPath(
    node: Node,
    path: Curve,
    duration: number,
    config: Partial<DragConfig>,
  ): ThreadGenerator {
    const callback: DragCallback = ({
      config,
      cursorTipOffset,
      clickOffset,
    }) => {
      const t = createSignal(0);
      let dragOffset = Vector2.zero;

      if (config.dragPivot) {
        dragOffset = node
          .absolutePosition()
          .sub(config.dragPivot.absolutePosition())
          .scale(1 + (1 - config.nodeScale));
      }

      const position = createComputed(() =>
        path
          .getPointAtPercentage(t())
          .position.transformAsPoint(path.localToWorld()),
      );
      this.absolutePosition(() =>
        position().sub(cursorTipOffset).add(clickOffset.scale(2)),
      );
      node.absolutePosition(() => position().add(dragOffset));

      return t(1, duration);
    };

    yield* this.drag(node, config, callback);
  }

  private *drag(
    node: Node,
    config: Partial<DragConfig>,
    callback: DragCallback,
  ): ThreadGenerator {
    const mergedConfig: DragConfig = Object.assign(
      {
        nodeScale: 0.9,
        ghostOpacity: 0.2,
        ghostScale: 1,
        dragOffset: Vector2.zero,
      },
      config ?? {},
    );
    const originalNodeScale = node.scale();
    const clickOffset = new Vector2(-1, 3);
    const nodeClone = node.reactiveClone({
      opacity: mergedConfig.ghostOpacity,
      scale: mergedConfig.ghostScale,
    });

    node.parent().add(nodeClone);
    nodeClone.moveBelow(node, true);

    yield* all(
      translate(this, clickOffset, 0.3),
      node.scale(originalNodeScale.scale(mergedConfig.nodeScale), 0.5),
    );

    yield* callback({
      config: mergedConfig,
      cursorTipOffset: this.cursorTipOffset,
      clickOffset,
    });

    yield* all(
      this.position(this.position().sub(clickOffset), 0.2),
      node.scale(originalNodeScale, 0.4),
    );
    nodeClone.remove();
  }
}
