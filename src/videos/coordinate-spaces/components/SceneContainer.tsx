import { CameraView } from '@ksassnowski/motion-canvas-camera';

import {
  Layout,
  Rect,
  RectProps,
  Shape,
  Txt,
  colorSignal,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d';
import {
  ColorSignal,
  PossibleColor,
  PossibleVector2,
  SignalValue,
  SimpleSignal,
  Vector2Signal,
  makeRef,
} from '@motion-canvas/core';

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
  gridStart?: SignalValue<number>;
  axisStart?: SignalValue<number>;
  axisEnd?: SignalValue<number>;
  sceneTree?: SignalValue<SceneTree>;
  labelScale?: SignalValue<PossibleVector2>;
  labelText?: SignalValue<string>;
  labelColor?: SignalValue<PossibleColor>;
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

  @initial(0)
  @signal()
  public declare readonly gridStart: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly axisStart: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly axisEnd: SimpleSignal<number, this>;

  @initial(3)
  @signal()
  public declare readonly axisLineWidth: SimpleSignal<number, this>;

  @vector2Signal('label')
  public declare readonly labelScale: Vector2Signal<this>;

  @initial('World Space')
  @signal()
  public declare readonly labelText: SimpleSignal<string, this>;

  @initial(theme.colors.Green1)
  @colorSignal()
  public declare readonly labelColor: ColorSignal<this>;

  @vector2Signal('origin')
  public declare readonly origin: Vector2Signal<this>;

  @signal()
  public declare readonly sceneTree: SimpleSignal<SceneTree, this>;

  public readonly camera: CameraView;

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
            axisStart={() => this.axisStart()}
            axisEnd={() => this.axisEnd()}
            end={this.gridEnd}
            start={this.gridStart}
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

        <Shape
          scale={1.5}
          topLeft={() =>
            this.topLeft()
              .transformAsPoint(this.localToParent().inverse())
              .add(20)
          }
          spawner={() => [this.sceneTree()]}
          layout
        />

        <Rect
          topRight={() =>
            this.topRight()
              .transformAsPoint(this.localToParent().inverse())
              .add([-20, 20])
          }
          fill={theme.colors.Gray5}
          stroke={theme.colors.Gray4}
          padding={[10, 26, 8, 26]}
          lineWidth={3}
          radius={10}
          width={240}
          height={55}
          justifyContent={'center'}
          scale={this.labelScale}
          smoothCorners
          layout
        >
          <Txt
            text={this.labelText}
            fill={this.labelColor}
            fontFamily={theme.fonts.sans}
            fontSize={32}
            letterSpacing={1.1}
          />
        </Rect>
      </>,
    );
  }

  public getDefaultAxisStart() {
    return this.gridStart();
  }

  public getDefaultAxisEnd() {
    return this.gridEnd();
  }
}
