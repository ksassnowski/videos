import { Node } from '@motion-canvas/2d';
import {
  InterpolationFunction,
  TimingFunction,
  Vector2,
  all,
  deepLerp,
  easeInOutCubic,
} from '@motion-canvas/core';

type NodeType<A extends any[]> = A extends (infer U)[] ? U : never;

export class NodeGroup<T extends Node[]> {
  public constructor(private nodes: T) {
    for (const node of nodes) {
      for (const { key } of node) {
        if (!this.hasOwnProperty(key)) {
          // *points at butterfly* Is this reflection?
          (this as any)[key] = this.createHandler(key);
        }
      }
    }
  }

  public *shift(
    value: Vector2,
    duration: number,
    timingFunction: TimingFunction = easeInOutCubic,
  ) {
    yield* all(
      ...this.nodes.map((node) =>
        node.position(node.position().add(value), duration, timingFunction),
      ),
    );
  }

  private createHandler(key: string) {
    return (
      value: any,
      duration: number,
      timingFunction: TimingFunction = easeInOutCubic,
      interpolationFunction: InterpolationFunction<any> = deepLerp,
    ) => {
      return all(
        ...this.nodes.map((node) =>
          (node as any)[key](
            value,
            duration,
            timingFunction,
            interpolationFunction,
          ),
        ),
      );
    };
  }
}

export function group<T extends Node[]>(...nodes: T) {
  return new NodeGroup(nodes) as NodeGroup<T> & NodeType<T>;
}
