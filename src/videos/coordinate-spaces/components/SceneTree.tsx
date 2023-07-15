import { SurroundingRectangle } from '@ksassnowski/motion-canvas-components';

import { Node, Rect, RectProps, Txt } from '@motion-canvas/2d/lib/components';
import { colorSignal, initial, signal } from '@motion-canvas/2d/lib/decorators';
import { Vector2, all, easeInBack } from '@motion-canvas/core';
import { chain, sequence } from '@motion-canvas/core/lib/flow';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeOutBack } from '@motion-canvas/core/lib/tweening';
import {
  ColorSignal,
  PossibleColor,
  PossibleVector2,
} from '@motion-canvas/core/lib/types';
import { makeRef, useLogger } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { Pill } from './Pill';

export interface SceneTreeObject {
  id: string;
  icon?: Node;
  label: string;
  children?: SceneTreeObject[];
}

export interface SceneTreeProps extends RectProps {
  objects?: SignalValue<SceneTreeObject[]>;
  indentMargin?: SignalValue<number>;
  lineGap?: SignalValue<PossibleVector2>;
  containerFill?: SignalValue<PossibleColor>;
}

export class SceneTree extends Rect {
  @initial([])
  @signal()
  public declare readonly objects: SimpleSignal<SceneTreeObject[], this>;

  @initial(24)
  @signal()
  public declare readonly indentMargin: SimpleSignal<number, this>;

  @initial(`${theme.colors.Gray5}aa`)
  @colorSignal()
  public declare readonly containerFill: ColorSignal<this>;

  private readonly objectRefs: Record<string, Rect> = {};
  private readonly container: Rect;
  private readonly title: Txt;
  private readonly highlightRect: SurroundingRectangle;

  public constructor(props: SceneTreeProps) {
    super({
      layout: true,
      ...props,
    });

    this.container = (
      <Rect
        fill={this.containerFill}
        gap={8}
        lineWidth={2}
        stroke={theme.colors.Gray4}
        padding={[10, 20, 10, 16]}
        direction={'column'}
        alignItems={'start'}
        radius={10}
        smoothCorners
        layout
      />
    ) as Rect;

    this.highlightRect = (
      <SurroundingRectangle
        nodes={[]}
        zIndex={-1}
        radius={8}
        buffer={[20, 9]}
        fill={`${theme.colors.Green1}aa`}
        scale={0}
        smoothCorners
        layout={false}
      />
    ) as SurroundingRectangle;

    this.title = (
      <Txt
        text={'SCENE'}
        fontSize={13}
        fontWeight={500}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.Gray2}
      />
    ) as Txt;

    this.add(this.container);
    this.container.add(this.title);
    this.container.add(this.highlightRect);
    this.container.add(
      <Pill
        ref={makeRef(this.objectRefs, 'root')}
        text={'Root'}
        textColor={theme.colors.Brown2}
        icon={
          <Rect
            stroke={theme.colors.Brown2}
            rotation={45}
            size={6}
            lineWidth={1}
          />
        }
      />,
    );
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

    return sequence(
      duration * 0.7,
      this.container.scale(1, duration, easeOutBack),
      sequence(
        0.1,
        ...objects.map((node) => node.scale(1, duration, easeOutBack)),
      ),
    );
  }

  public highlightNode(
    id: string,
    duration: number,
    color?: PossibleColor,
  ): ThreadGenerator {
    const node = this.objectRefs[id];

    if (!node) {
      useLogger().error(`Attempting to highlight node with unknown id ${id}`);
      return;
    }

    let animations: ThreadGenerator[] = [];
    const rectHidden = this.highlightRect.scale().exactlyEquals(Vector2.zero);

    if (rectHidden) {
      if (color) {
        this.highlightRect.fill(`${color}88`);
      }
      this.highlightRect.nodes(node);
      animations.push(this.highlightRect.scale(1, duration));
    } else {
      if (color) {
        animations.push(this.highlightRect.fill(`${color}88`, duration));
      }
      animations.push(this.highlightRect.nodes(node, duration));
    }

    return all(...animations);
  }

  public resetHighlight(duration = 0.7): ThreadGenerator {
    return this.highlightRect.scale(0, duration);
  }

  public insertObject(object: SceneTreeObject, level = 0) {
    const pill = this.addObject(object, level);
    const size = pill.size();
    pill.size(0).scale(0).margin.top(-this.container.gap().y);
    return all(
      pill.size(size, 0.5),
      pill.scale(1, 0.7),
      pill.margin.top(0, 0.3),
    );
  }

  private addChildren(): void {
    const objects = this.objects();

    for (const object of objects) {
      this.addObject(object);
    }
  }

  private addObject(object: SceneTreeObject, level = 0): Rect {
    const margin = this.indentMargin();

    const pill = (
      <Pill
        ref={makeRef(this.objectRefs, object.id)}
        text={object.label}
        icon={object.icon}
        marginLeft={22 + margin * level}
      />
    ) as Rect;

    this.container.add(pill);

    for (const child of object.children ?? []) {
      this.addObject(child, level + 1);
    }

    return pill;
  }
}
