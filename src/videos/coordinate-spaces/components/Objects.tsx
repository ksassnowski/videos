import {
  Circle,
  CircleProps,
  Rect,
  RectProps,
} from '@motion-canvas/2d/lib/components';

import theme from '@theme';

import { SceneTree, SceneTreeProps } from './SceneTree';

export const CircleObject = (props: CircleProps) => (
  <Circle size={60} fill={theme.colors.Red} {...props} />
);

export const RectObject = (props: RectProps) => (
  <Rect
    size={80}
    radius={18}
    smoothCorners
    fill={theme.colors.Blue1}
    {...props}
  />
);

export const RectCircleSceneTree = (props: SceneTreeProps) => (
  <SceneTree
    objects={[
      {
        id: 'rect',
        label: 'Rectangle',
        icon: (
          <Rect
            size={10}
            fill={theme.colors.Blue1}
            radius={2}
            lineWidth={3}
            stroke={`${theme.colors.Blue1}88`}
          />
        ),
        children: [
          {
            id: 'circle',
            label: 'Circle',
            icon: (
              <Circle
                size={10}
                fill={theme.colors.Red}
                lineWidth={3}
                stroke={`${theme.colors.Red}88`}
              />
            ),
          },
        ],
      },
    ]}
    scale={1.5}
    {...props}
  />
);
