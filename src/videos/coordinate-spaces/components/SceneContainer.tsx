import {
  FunctionComponent,
  Grid,
  Layout,
  Rect,
  RectProps,
} from '@motion-canvas/2d/lib/components';

import theme from '@theme';

export const SceneContainer: FunctionComponent = ({
  children,
  ...rest
}: RectProps = {}) => (
  <Rect
    fill={theme.colors.Gray5}
    lineWidth={8}
    stroke={theme.colors.Gray4}
    width={1000}
    height={800}
    smoothCorners
    radius={18}
    padding={4}
    layout
    clip
    {...rest}
  >
    <Grid
      spacing={50}
      stroke={theme.colors.White}
      width={'100%'}
      height={'100%'}
      opacity={0.1}
    />

    <Layout layout={false}>{children}</Layout>
  </Rect>
);
