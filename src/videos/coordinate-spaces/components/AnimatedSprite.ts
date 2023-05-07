import { Img, ImgProps } from '@motion-canvas/2d/lib/components';
import {
  initial,
  signal,
  vector2Signal,
} from '@motion-canvas/2d/lib/decorators';
import { drawImage } from '@motion-canvas/2d/lib/utils';
import { loop } from '@motion-canvas/core/lib/flow';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import {
  BBox,
  PossibleVector2,
  Vector2Signal,
} from '@motion-canvas/core/lib/types';
import { usePlayback, useThread } from '@motion-canvas/core/lib/utils';

import { Animation, SpriteAnimations } from './Animation';

export interface AnimatedSpriteProps extends ImgProps {
  frame?: SignalValue<number>;
  spacing?: SignalValue<number>;
  frameSize?: SignalValue<PossibleVector2>;
  animations?: SignalValue<SpriteAnimations>;
}

export class AnimatedSprite extends Img {
  @vector2Signal('frameSize')
  public declare readonly frameSize: Vector2Signal<this>;

  @initial(1)
  @signal()
  public declare readonly frames: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly frame: SimpleSignal<number, this>;

  @initial(12)
  @signal()
  public declare readonly fps: SimpleSignal<number, this>;

  @initial({})
  @signal()
  public declare readonly animations: SimpleSignal<SpriteAnimations, this>;

  private currentAnimation: ThreadGenerator | null = null;

  public constructor(props: AnimatedSpriteProps) {
    super(props);
  }

  public loop(name: string): ThreadGenerator {
    const animation = this.animations().findByName(name);
    if (!animation) {
      throw new Error(`Unknown animation ${name}`);
    }

    return this.playAnimation(animation, Infinity);
  }

  public playOnce(name: string): ThreadGenerator {
    const animation = this.animations().findByName(name);
    if (!animation) {
      throw new Error(`Unknown animation ${name}`);
    }

    return this.playAnimation(animation, animation.fps * animation.frames - 1);
  }

  private playAnimation(animation: Animation, times: number): ThreadGenerator {
    const thread = useThread();
    const playback = usePlayback();
    const startTime = thread.time();

    this.currentAnimation = loop(times, () => {
      const elapsedTime = thread.time() - startTime;
      const elapsedFrames = playback.secondsToFrames(elapsedTime);
      const animationFrame =
        Math.floor(elapsedFrames / animation.fps) % (animation.frames + 1);
      this.frame(animation.getFrame(animationFrame));
    });

    return this.currentAnimation;
  }

  protected override draw(context: CanvasRenderingContext2D) {
    this.drawShape(context);
    if (this.clip()) {
      context.clip(this.getPath());
    }
    const frame = this.frame();
    const frameSize = this.size();
    const source = new BBox(frame * frameSize.x, 0, frameSize.x, frameSize.y);
    const destination = BBox.fromSizeCentered(this.computedSize());
    context.save();
    context.imageSmoothingEnabled = false;
    drawImage(context, this.image(), source, destination);
    context.restore();
    this.drawChildren(context);
  }
}
