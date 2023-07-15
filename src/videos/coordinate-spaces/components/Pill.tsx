import { RectProps } from '@motion-canvas/2d';
import { Layout, Node, Rect, Txt } from '@motion-canvas/2d/lib/components';
import { PossibleColor } from '@motion-canvas/core/lib/types';

import theme from '@theme';

export const Pill = ({
  text,
  textColor,
  icon,
  ...rest
}: RectProps & { text: string; textColor?: PossibleColor; icon: Node }) => (
  <Layout
    alignItems={'center'}
    layout
    smoothCorners
    radius={4}
    gap={12}
    {...rest}
  >
    {icon}
    <Txt
      text={text}
      fontSize={16}
      fontWeight={400}
      fontFamily={theme.fonts.mono}
      fill={textColor ?? theme.colors.White}
    />
  </Layout>
);
