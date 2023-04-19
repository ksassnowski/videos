import { Node, Txt, TxtProps } from '@motion-canvas/2d/lib/components';
import {
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { PossibleVector2, Vector2Signal } from '@motion-canvas/core/lib/types';

export interface PointLabelProps extends TxtProps {
  point: SignalValue<Node>;
  buffer: SignalValue<PossibleVector2>;
}

export class PointLabel extends Txt {
  @vector2Signal('buffer')
  public declare readonly buffer: Vector2Signal<this>;

  @initial(null)
  @signal()
  public declare readonly point: SimpleSignal<Node>;

  constructor(props: PointLabelProps) {
    super({
      ...props,
      position: () => this.point().position().add(this.buffer()),
    });
  }
}
