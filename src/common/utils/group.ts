import { Node, NodeState } from "@motion-canvas/2d/lib/components";
import { all } from "@motion-canvas/core/lib/flow";
import { ThreadGenerator } from "@motion-canvas/core/lib/threading";
import {
  deepLerp,
  easeInOutCubic,
  InterpolationFunction,
  TimingFunction,
  tween
} from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import { getPropertiesOf } from "@motion-canvas/2d/src/decorators/signal";

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

  public save() {
    for (const node of this.nodes) {
      // @ts-ignore
      node.stateStack.push(this.getNodeState(node));
    }
  }

  public restore(
    duration: number,
    timingFunction: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    return all(
      ...this.nodes.map((node) => {
        // @ts-ignore
        const state: NodeState = node.stateStack.pop();
        const currentState = this.getNodeState(node);

        if (state === undefined) {
          return;
        }

        for (const prop in state) {
          if (state[prop] === currentState[prop]) {
            delete state[prop];
          }
        }

        return tween(duration, (value) => {
          const t = timingFunction(value);

          const nextState = Object.keys(state).reduce((newState, key) => {
            newState[key] = deepLerp(currentState[key], state[key], t);
            return newState;
          }, {} as NodeState);

          for (const [key, meta] of Object.entries(getPropertiesOf(node))) {
            const signal = (node as any)[key];
            if (key in nextState) {
              signal(nextState[key]);
            }
            if (meta.compoundEntries !== undefined) {
              for (const [key, property] of meta.compoundEntries) {
                if (property in nextState) {
                  signal[key](nextState[property]);
                }
              }
            }
          }
        })
      })
    );
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

  private getNodeState(node: Node): NodeState {
    const state: NodeState = {};

    for (const { key, meta, signal } of node) {
      if (!meta.cloneable) continue;
      if (meta.compound) {
        for (const [key, property] of meta.compoundEntries) {
          if (property in state) continue;
          state[property] = (<Record<string, SimpleSignal<any>>>(
            (<unknown>signal)
          ))[key].context.raw();
        }
      } else {
        state[key] = signal.context.raw();
      }
    }

    return state;
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
