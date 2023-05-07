import { Img, ImgProps } from '@motion-canvas/2d/lib/components';

import bloodSprite from '../assets/blood_spritesheet.png';
import goblin8x8Sprite from '../assets/goblin_8x8.png';
import goblinSprite from '../assets/goblin_sprite.png';
import hero8x8Sprite from '../assets/hero_8x8.png';
import heroineSprite from '../assets/heroine_sprite.png';
import spear8x8Sprite from '../assets/spear_8x8.png';
import spearSprite from '../assets/spear_sprite.png';
import torchSprite from '../assets/torch_spritesheet.png';
import { AnimatedSprite, AnimatedSpriteProps } from './AnimatedSprite';
import { Animation, SpriteAnimations } from './Animation';

export const Hero = (props: AnimatedSpriteProps) => (
  <AnimatedSprite
    src={heroineSprite}
    size={[16, 32]}
    offset={[0, 0.5]}
    animations={
      new SpriteAnimations({
        idle: Animation.sequential({
          startFrame: 0,
          endFrame: 3,
          fps: 8,
        }),
        walk: Animation.sequential({
          startFrame: 4,
          endFrame: 7,
          fps: 6,
        }),
        attack: Animation.custom({
          frames: [2, 2, 2, 2, 2, 2, 3, 3, 0],
          fps: 4,
        }),
      })
    }
    {...props}
  />
);

export const Torch = (props: AnimatedSpriteProps) => (
  <AnimatedSprite
    src={torchSprite}
    size={[16, 32]}
    animations={
      new SpriteAnimations({
        default: Animation.sequential({
          startFrame: 0,
          endFrame: 3,
          fps: 6,
        }),
      })
    }
    {...props}
  />
);

export const Blood = (props: AnimatedSpriteProps) => (
  <AnimatedSprite
    src={bloodSprite}
    size={[110, 93]}
    animations={
      new SpriteAnimations({
        default: Animation.sequential({
          startFrame: 0,
          endFrame: 9,
          fps: 4,
        }),
        stain: Animation.sequential({
          startFrame: 0,
          endFrame: 3,
          fps: 2,
        }),
      })
    }
    {...props}
  />
);

export const Goblin = (props: AnimatedSpriteProps) => (
  <AnimatedSprite
    src={goblinSprite}
    size={[16, 16]}
    animations={
      new SpriteAnimations({
        idle: Animation.sequential({
          startFrame: 0,
          endFrame: 3,
          fps: 8,
        }),
        walk: Animation.sequential({
          startFrame: 4,
          endFrame: 7,
          fps: 6,
        }),
      })
    }
    {...props}
  />
);

export const Spear = (props: ImgProps) => (
  <Img src={spearSprite} smoothing={false} {...props} />
);

export const Hero8x8 = (props: ImgProps) => (
  <Img src={hero8x8Sprite} smoothing={false} {...props} />
);

export const Goblin8x8 = (props: ImgProps) => (
  <Img src={goblin8x8Sprite} smoothing={false} {...props} />
);

export const Spear8x8 = (props: ImgProps) => (
  <Img src={spear8x8Sprite} smoothing={false} {...props} />
);
