import { makeScene2D } from '@motion-canvas/2d';
import {
  Grid,
  Layout,
  Node,
  Rect,
  Txt,
} from '@motion-canvas/2d/lib/components';
import { waitFor } from '@motion-canvas/core/lib/flow';
import { createRef } from '@motion-canvas/core/lib/utils';

import theme from '@theme';

import { SceneContainer } from '../components';

export default makeScene2D(function* (view) {
  const container = createRef<Node>();
  const rectGlobal = createRef<Rect>();

  view.add(
    <Layout layout gap={84}>
      <Layout direction={'column'} gap={24}>
        <Txt
          fontFamily={theme.fonts.mono}
          fontSize={28}
          fontWeight={600}
          fill={theme.colors.Sand}
          text={'Global space'}
        />
        <SceneContainer width={800} height={600}>
          <Rect
            radius={18}
            smoothCorners
            clip
            width={800}
            height={600}
            zIndex={-2}
          >
            <Grid
              lineWidth={1}
              stroke={theme.colors.Gray4}
              width={1000}
              height={800}
              spacing={50}
              opacity={0.5}
            />
          </Rect>
        </SceneContainer>
      </Layout>

      <Layout direction={'column'} gap={24}>
        <Txt
          fontFamily={theme.fonts.mono}
          fontSize={28}
          fontWeight={600}
          fill={theme.colors.Blue1}
          text={'Local space'}
        />
        <SceneContainer width={800} height={600}>
          <Rect
            radius={18}
            smoothCorners
            clip
            width={800}
            height={600}
            zIndex={-2}
          >
            <Grid
              lineWidth={1}
              stroke={theme.colors.Gray4}
              width={1000}
              height={800}
              spacing={50}
              opacity={0.5}
            />
          </Rect>
        </SceneContainer>
      </Layout>
    </Layout>,
  );

  yield* waitFor(2);
});
