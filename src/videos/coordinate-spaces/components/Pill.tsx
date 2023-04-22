import {
  Layout,
  Node,
  Rect,
  RectProps,
  Txt,
} from '@motion-canvas/2d/lib/components';

import theme from '@theme';

export const Pill = ({
  text,
  icon,
  ...rest
}: RectProps & { text: string; icon: Node }) => (
  <Rect
    fill={theme.colors.White}
    minHeight={60}
    padding={[14, 18]}
    width={220}
    smoothCorners
    radius={10}
    shadowColor={theme.colors.Brown3}
    shadowOffset={[0, 4]}
    direction={'column'}
    gap={16}
    layout
    {...rest}
  >
    <Layout alignItems={'center'} gap={14}>
      {icon}
      <Txt
        text={text}
        fontSize={28}
        fontWeight={500}
        letterSpacing={-1.2}
        fontFamily={theme.fonts.mono}
        fill={theme.colors.Gray3}
      />
    </Layout>
  </Rect>
);
