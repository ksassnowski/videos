import {
  Grid,
  Layout,
  Line,
  Node,
  Rect,
  RectProps,
} from '@motion-canvas/2d/lib/components';
import {
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import {
  ColorSignal,
  PossibleColor,
  PossibleVector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';

import theme from '@theme';

export interface SceneContainerProps extends RectProps {
  showAxis?: SignalValue<boolean>;
  origin?: SignalValue<PossibleVector2>;
  gridSpacing?: SignalValue<number>;
  gridStroke?: SignalValue<PossibleColor>;
}

export class SceneContainer extends Rect {
  @initial(false)
  @signal()
  public declare readonly showAxis: SimpleSignal<boolean, this>;

  @initial(50)
  @signal()
  public declare readonly gridSpacing: SimpleSignal<number, this>;

  @initial('#363637')
  @signal()
  public declare readonly gridStroke: ColorSignal<this>;

  @vector2Signal('origin')
  public declare readonly origin: Vector2Signal<this>;

  public constructor(props: SceneContainerProps) {
    super({
      fill: theme.colors.Gray5,
      lineWidth: 8,
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
        <Node position={this.origin}>
          <Grid
            spacing={this.gridSpacing}
            stroke={this.gridStroke}
            width={'100%'}
            height={'100%'}
            layout={false}
          />

          {this.showAxis() && (
            <Line
              stroke={'#454545'}
              points={() => [
                [0, 396],
                [0, -396],
              ]}
              lineWidth={3}
              layout={false}
            />
          )}

          {this.showAxis() && (
            <Line
              stroke={'#454545'}
              points={[
                [-496, 0],
                [496, 0],
              ]}
              lineWidth={3}
              layout={false}
            />
          )}

          <Layout layout={false}>{props.children}</Layout>
        </Node>

        <Rect
          lineWidth={this.lineWidth}
          stroke={this.stroke}
          width={'100%'}
          height={'100%'}
          radius={this.radius}
          smoothCorners
        />
      </>,
    );
  }
}
