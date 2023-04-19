import { Layout, LayoutProps, Txt } from '@motion-canvas/2d/lib/components';
import { SignalValue, isReactive } from '@motion-canvas/core/lib/signals';
import { makeRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

export interface LerpFormulaProps extends LayoutProps {
  a: number | string;
  b: number | string;
  t: SignalValue<number | string>;
  refs?: Record<number, Txt>;
  fontSize?: number;
}

export class LerpFormula extends Layout {
  public readonly refs: Txt[] = [];

  constructor({ a, b, t, refs, fontSize, ...rest }: LerpFormulaProps) {
    super({
      gap: 6,
      layout: true,
      ...rest,
    });

    const tValue = isReactive(t) ? t() : t;

    const formulaParts = [
      { text: 'lerp', color: theme.colors.Red },
      { text: '(', color: theme.colors.Gray3 },
      { text: a.toString(), color: theme.colors.Blue1 },
      { text: ',', color: theme.colors.Gray3 },
      { text: b.toString(), color: theme.colors.Brown2 },
      { text: ',', color: theme.colors.Gray3 },
      { text: tValue.toString(), color: theme.colors.Green1 },
      { text: ')', color: theme.colors.Gray3 },
      { text: '', color: theme.colors.Red },
      { text: '=', color: theme.colors.Red },
      { text: '', color: theme.colors.Red },
      { text: a.toString(), color: theme.colors.Blue1 },
      { text: '', color: theme.colors.Red },
      { text: '+', color: theme.colors.Gray2 },
      { text: '', color: theme.colors.Red },
      { text: tValue.toString(), color: theme.colors.Green1 },
      { text: '', color: theme.colors.Red },
      { text: '*', color: theme.colors.Gray2 },
      { text: '', color: theme.colors.Red },
      { text: '(', color: theme.colors.Gray3 },
      { text: b.toString(), color: theme.colors.Brown2 },
      { text: '', color: theme.colors.Red },
      { text: '-', color: theme.colors.Gray2 },
      { text: '', color: theme.colors.Red },
      { text: a.toString(), color: theme.colors.Blue1 },
      { text: ')', color: theme.colors.Gray3 },
    ];

    let i = 0;
    this.add(
      <>
        {formulaParts.map((part) => (
          <Txt
            ref={part.text !== '' ? makeRef(this.refs, i++) : null}
            text={part.text}
            fill={part.color}
            fontFamily={'Operator Mono'}
            fontSize={fontSize ?? 32}
          />
        ))}
      </>,
    );
  }
}
