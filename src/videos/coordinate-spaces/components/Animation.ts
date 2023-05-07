export interface CustomAnimationProps {
  frames: number[];
  fps: number;
}

export interface SequentialAnimationProps {
  startFrame: number;
  endFrame: number;
  fps: number;
}

export abstract class Animation {
  public static sequential(props: SequentialAnimationProps): Animation {
    return new SequentialAnimation(props);
  }

  public static custom(props: CustomAnimationProps): Animation {
    return new CustomAnimation(props);
  }

  public abstract get frames(): number;

  public abstract get fps(): number;

  public abstract getFrame(index: number): number;
}

export class SequentialAnimation extends Animation {
  public get frames(): number {
    return this.props.endFrame - this.props.startFrame;
  }

  public get fps(): number {
    return this.props.fps;
  }

  public constructor(public readonly props: SequentialAnimationProps) {
    super();
  }

  public getFrame(index: number): number {
    return this.props.startFrame + index;
  }
}

export class CustomAnimation extends Animation {
  public get frames(): number {
    return this.props.frames.length;
  }

  public get fps(): number {
    return this.props.fps;
  }

  public constructor(public readonly props: CustomAnimationProps) {
    super();
  }

  public getFrame(index: number): number {
    return this.props.frames[index];
  }
}

export class SpriteAnimations {
  public constructor(public readonly animations: Record<string, Animation>) {}

  public findByName(name: string): Animation | null {
    return this.animations[name];
  }
}
