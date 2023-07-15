import {
  Circle,
  CircleProps,
  Icon,
  IconProps,
  Rect,
  RectProps,
} from '@motion-canvas/2d';

import theme from '@theme';

import { SceneTree, SceneTreeObject, SceneTreeProps } from './SceneTree';
import { Goblin8x8, Hero8x8, Spear8x8 } from './Sprites';

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
    {...props}
  />
);

export const GameSceneTree = (props: SceneTreeProps) => {
  const heroIcon = <Hero8x8 scale={2.4} />;
  const spearIcon = <Spear8x8 scale={2.4} />;
  const goblinIcon = <Goblin8x8 scale={2.4} />;

  return (
    <SceneTree
      objects={[
        { id: 'goblin', icon: goblinIcon, label: 'Goblin' },
        {
          id: 'hero',
          icon: heroIcon,
          label: 'Hero',
          children: [
            {
              id: 'spear',
              icon: spearIcon,
              label: 'Spear',
            },
          ],
        },
      ]}
      opacity={0}
      {...props}
    />
  );
};

export const ExtendedGameSceneTree = (props: SceneTreeProps) => {
  const heroIcon = <Hero8x8 scale={2.4} />;
  const spearIcon = <Spear8x8 scale={2.4} />;
  const goblinIcon = <Goblin8x8 scale={2.4} />;
  const NodeIcon = () => (
    <Icon
      icon={'solar:box-minimalistic-outline'}
      width={12}
      color={theme.colors.Blue1}
    />
  );

  return (
    <SceneTree
      objects={[
        {
          id: 'goblin',
          icon: <NodeIcon />,
          label: 'Goblin',
          children: [
            {
              id: 'goblin-sprite',
              icon: goblinIcon,
              label: 'Sprite',
            },
          ],
        },
        {
          id: 'hero',
          icon: <NodeIcon />,
          label: 'Hero',
          children: [
            {
              id: 'hero-sprite',
              label: 'Sprite',
              icon: heroIcon,
            },
            {
              id: 'spear',
              icon: <NodeIcon />,
              label: 'Spear',
              children: [
                {
                  id: 'spear-sprite',
                  label: 'Sprite',
                  icon: spearIcon,
                },
              ],
            },
          ],
        },
      ]}
      {...props}
    />
  );
};
