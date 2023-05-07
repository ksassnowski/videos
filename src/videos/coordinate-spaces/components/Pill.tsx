import {
  Layout,
  Node,
  Rect,
  RectProps,
  Txt,
} from '@motion-canvas/2d/lib/components';
import { grayscale } from '@motion-canvas/2d/lib/partials';

import theme from '@theme';

export const Pill = ({
  text,
  icon,
  ...rest
}: RectProps & { text: string; icon: Node }) => (
  <Rect
    padding={[5, 10]}
    direction={'column'}
    justifyContent={'center'}
    gap={16}
    layout
    smoothCorners
    radius={4}
    {...rest}
  >
    <Layout alignItems={'center'} gap={14}>
      {icon}
      <Txt
        text={text}
        fontSize={16}
        fontWeight={400}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.White}
      />
    </Layout>
  </Rect>
);
