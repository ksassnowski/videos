import { Layout, LayoutProps, Txt } from '@motion-canvas/2d/lib/components';
import {
  colorSignal,
  initial,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { PossibleCanvasStyle } from '@motion-canvas/2d/lib/partials';
import { SignalValue } from '@motion-canvas/core/lib/signals';
import {
  ColorSignal,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';

import theme from '@theme';

export interface CoordinateProps extends LayoutProps {
  coordinates: SignalValue<Vector2>;
  xColor?: SignalValue<PossibleCanvasStyle>;
  yColor?: SignalValue<PossibleCanvasStyle>;
}

export class Coordinates extends Layout {
  @vector2Signal('coordinates')
  public declare readonly coordinates: Vector2Signal<this>;

  @initial(theme.colors.Red)
  @colorSignal()
  public declare readonly xColor: ColorSignal<this>;

  @initial(theme.colors.Green1)
  @colorSignal()
  public declare readonly yColor: ColorSignal<this>;

  public constructor(props: CoordinateProps) {
    super({
      fontFamily: theme.fonts.mono,
      fontSize: 28,
      gap: 2,
      layout: true,
      ...props,
    });

    this.add(
      <>
        <Txt text={'('} fill={theme.colors.Gray2} />
        <Txt
          text={() => Math.round(this.coordinates().x).toString()}
          fill={this.xColor()}
        />
        <Txt text={','} fill={theme.colors.Gray2} />
        <Txt
          text={() => Math.round(this.coordinates().y).toString()}
          fill={this.yColor()}
        />
        <Txt text={')'} fill={theme.colors.Gray2} />
      </>,
    );
  }
}
