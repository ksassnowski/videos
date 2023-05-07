import {
  Line,
  Node,
  Rect,
  RectProps,
  Shape,
  Txt,
} from '@motion-canvas/2d/lib/components';
import {
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { sequence } from '@motion-canvas/core/lib/flow';
import {
  SignalValue,
  SimpleSignal,
  createComputed,
} from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeOutBack } from '@motion-canvas/core/lib/tweening';
import {
  Origin,
  PossibleVector2,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';
import { makeRef, useLogger } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { Pill } from './Pill';

export interface SceneTreeObject {
  id: string;
  icon: Node;
  label: string;
  children?: SceneTreeObject[];
}

export interface SceneTreeProps extends RectProps {
  objects?: SceneTreeObject[];
  indentMargin?: SignalValue<number>;
  lineGap?: SignalValue<PossibleVector2>;
}

export class SceneTree extends Rect {
  @initial([])
  @signal()
  public declare readonly objects: SimpleSignal<SceneTreeObject[], this>;

  @initial(35)
  @signal()
  public declare readonly indentMargin: SimpleSignal<number, this>;

  @initial(new Vector2(10, 4))
  @vector2Signal('lineGap')
  public declare readonly lineGap: Vector2Signal<this>;

  private readonly objectRefs: Record<string, Rect> = {};
  private readonly lineRefs: Line[] = [];
  private readonly container: Rect;
  private readonly title: Txt;

  public constructor(props: SceneTreeProps) {
    super(props);

    this.container = (
      <Rect
        fill={theme.colors.Gray5}
        lineWidth={2}
        stroke={theme.colors.Gray4}
        padding={[10, 5, 5, 10]}
        direction={'column'}
        radius={10}
        gap={5}
        smoothCorners
        layout
      />
    ) as Rect;

    this.title = (
      <Txt
        text={'SCENE'}
        fontSize={13}
        fontWeight={500}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.Gray2}
        marginLeft={5}
      />
    ) as Txt;

    this.add(this.container);
    this.container.add(this.title);
    this.addChildren();
  }

  public getObject(id: string): Rect {
    const node = this.objectRefs[id];
    if (!node) {
      throw new Error(`Trying to retrieve object without unknown id ${id}`);
    }
    return node;
  }

  public create(duration: number): ThreadGenerator {
    const objects = Object.values(this.objectRefs);

    // Assuming the scene tree has been hidden up until now...
    this.opacity(1);
    this.container.scale(0);
    objects.map((node) => node.scale(0));
    this.lineRefs.map((line) => line.end(0));

    return sequence(
      duration * 0.7,
      this.container.scale(1, duration, easeOutBack),
      sequence(
        0.1,
        ...objects.map((node) => node.scale(1, duration, easeOutBack)),
      ),
      sequence(0.15, ...this.lineRefs.map((line) => line.end(1, duration))),
    );
  }

  public highlightNode(id: string, duration: number): ThreadGenerator {
    const node = this.objectRefs[id];

    if (!node) {
      useLogger().error(`Attempting to highlight node with unknown id ${id}`);
      return;
    }

    return node.scale(1.2, duration);
  }

  public resetNode(id: string, duration: number): ThreadGenerator {
    const node = this.objectRefs[id];

    if (!node) {
      useLogger().error(`Attempting to highlight node with unknown id ${id}`);
      return;
    }

    return node.scale(1, duration);
  }

  private addChildren(): void {
    const objects = this.objects();

    for (const object of objects) {
      this.addObject(object);
    }
  }

  private addObject(object: SceneTreeObject, parent?: Shape, level = 0): void {
    const margin = this.indentMargin();
    const lineGap = this.lineGap();

    const pill = (
      <Pill
        ref={makeRef(this.objectRefs, object.id)}
        text={object.label}
        icon={object.icon}
        marginLeft={margin * level}
      />
    ) as Rect;

    this.container.add(pill);

    if (parent) {
      const lineStart = createComputed(() =>
        parent
          .position()
          .add(parent.getOriginDelta(Origin.BottomLeft).add([14, lineGap.y])),
      );

      this.add(
        <Line
          ref={makeRef(this.lineRefs, this.lineRefs.length)}
          lineWidth={2}
          stroke={theme.colors.Gray3}
          points={() => [
            lineStart(),
            [lineStart().x, pill.position.y()],
            [lineStart().x + margin - lineGap.x * 2, pill.position.y()],
          ]}
          radius={4}
          layout={false}
        />,
      );
    }

    for (const child of object.children ?? []) {
      this.addObject(child, pill, level + 1);
    }
  }
}
