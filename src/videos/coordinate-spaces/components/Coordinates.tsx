import { Layout, LayoutProps, Txt } from '@motion-canvas/2d/lib/components';
import {
  colorSignal,
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { PossibleCanvasStyle } from '@motion-canvas/2d/lib/partials';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInBack, easeOutBack } from '@motion-canvas/core/lib/tweening';
import {
  ColorSignal,
  PossibleVector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';

import theme from '@theme';

export interface CoordinateProps extends LayoutProps {
  coordinates: SignalValue<PossibleVector2>;
  xColor?: SignalValue<PossibleCanvasStyle>;
  yColor?: SignalValue<PossibleCanvasStyle>;
  decimals?: SignalValue<number>;
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

  @initial(0)
  @signal()
  public declare readonly decimals: SimpleSignal<number, this>;

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
          text={() => this.coordinates().x.toFixed(this.decimals()).toString()}
          fill={this.xColor()}
        />
        <Txt text={','} fill={theme.colors.Gray2} />
        <Txt
          text={() => this.coordinates().y.toFixed(this.decimals()).toString()}
          fill={this.yColor()}
        />
        <Txt text={')'} fill={theme.colors.Gray2} />
      </>,
    );
  }

  public show(duration = 0.6): ThreadGenerator {
    return this.scale(1, duration, easeOutBack);
  }

  public hide(duration = 0.6): ThreadGenerator {
    return this.scale(0, duration, easeInBack);
  }
}
