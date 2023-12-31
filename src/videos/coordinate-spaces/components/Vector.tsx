import { Line, LineProps, Ray } from '@motion-canvas/2d/lib/components';
import { SignalValue } from '@motion-canvas/core/lib/signals';
import { PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';

import theme from '@theme';

export interface VectorProps extends LineProps {
  from?: SignalValue<PossibleVector2>;
  to: SignalValue<PossibleVector2>;
}

export const Vector = ({ from = Vector2.zero, to, ...rest }: VectorProps) => (
  <Ray
    arrowSize={13}
    lineWidth={4}
    stroke={theme.colors.White}
    from={from}
    to={to}
    endArrow
    {...rest}
  />
);
