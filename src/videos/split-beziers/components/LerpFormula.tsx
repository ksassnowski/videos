import { Layout, LayoutProps, Text } from '@motion-canvas/2d/lib/components';
import { SignalValue, isReactive } from '@motion-canvas/core/lib/signals';
import { makeRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

export interface LerpFormulaProps extends LayoutProps {
  a: number | string;
  b: number | string;
  t: SignalValue<number | string>;
  refs?: Record<number, Text>;
  fontSize?: number;
}

export function LerpFormula({
  a,
  b,
  t,
  refs,
  fontSize,
  ...rest
}: LerpFormulaProps) {
  const tValue = isReactive(t) ? t() : t;
  refs ??= {};

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
  return (
    <Layout gap={6} layout {...rest}>
      {...formulaParts.map((part) => (
        <Text
          ref={part.text !== '' ? makeRef(refs, i++) : null}
          text={part.text}
          fill={part.color}
          fontFamily={'Operator Mono'}
          fontSize={fontSize ?? 32}
        />
      ))}
    </Layout>
  );
}
