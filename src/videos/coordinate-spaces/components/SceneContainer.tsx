import { CameraView } from '@ksassnowski/motion-canvas-camera';

import {
  Layout,
  Line,
  Rect,
  RectProps,
} from '@motion-canvas/2d/lib/components';
import {
  colorSignal,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { sequence } from '@motion-canvas/core';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import {
  ColorSignal,
  PossibleColor,
  PossibleVector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';
import { makeRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { Grid } from '.';
import { SceneTree } from './SceneTree';

export interface SceneContainerProps extends RectProps {
  showAxis?: SignalValue<boolean>;
  origin?: SignalValue<PossibleVector2>;
  gridSpacing?: SignalValue<number>;
  gridStroke?: SignalValue<PossibleColor>;
  axisStroke?: SignalValue<PossibleColor>;
  axisLineWidth?: SignalValue<number>;
  gridEnd?: SignalValue<number>;
  sceneTree?: SceneTree;
}

export class SceneContainer extends Rect {
  @initial(false)
  @signal()
  public declare readonly showAxis: SimpleSignal<boolean, this>;

  @initial(50)
  @signal()
  public declare readonly gridSpacing: SimpleSignal<number, this>;

  @initial('#363637')
  @colorSignal()
  public declare readonly gridStroke: ColorSignal<this>;

  @initial('#454545')
  @colorSignal()
  public declare readonly axisStroke: ColorSignal<this>;

  @initial(1)
  @signal()
  public declare readonly gridEnd: SimpleSignal<number, this>;

  @initial(3)
  @signal()
  public declare readonly axisLineWidth: SimpleSignal<number, this>;

  @vector2Signal('origin')
  public declare readonly origin: Vector2Signal<this>;

  public readonly camera: CameraView;
  public readonly sceneTree: Layout;

  public constructor(props: SceneContainerProps) {
    super({
      fill: theme.colors.Gray5,
      lineWidth: 0,
      stroke: theme.colors.Gray4,
      width: 1000,
      height: 800,
      smoothCorners: true,
      radius: 18,
      clip: true,
      layout: true,
      ...props,
    });

    this.add(
      <>
        <CameraView
          ref={makeRef(this, 'camera')}
          width={3000}
          height={3000}
          layout={false}
        >
          <Grid
            spacing={this.gridSpacing}
            stroke={this.gridStroke}
            width={3000}
            height={3000}
            drawAxis={this.showAxis}
            axisLineWidth={this.axisLineWidth}
            axisStroke={this.axisStroke}
            end={this.gridEnd}
            layout={false}
          />

          <Layout layout={false}>{props.children}</Layout>
        </CameraView>

        <Rect
          lineWidth={this.lineWidth}
          stroke={this.stroke}
          width={'100%'}
          height={'100%'}
          radius={this.radius}
          smoothCorners
        />

        {props.sceneTree && (
          <Layout
            ref={makeRef(this, 'sceneTree')}
            layout={false}
            topLeft={[-370, -305]}
          >
            {props.sceneTree}
          </Layout>
        )}
      </>,
    );
  }
}
