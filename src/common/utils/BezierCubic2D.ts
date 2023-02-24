import { Polynomial2D } from "@common/utils/Polynomial2D";

import { CurvePoint } from "@motion-canvas/2d/lib/curves";
import { computed } from "@motion-canvas/2d/lib/decorators";
import { Vector2 } from "@motion-canvas/core/lib/types";

export class BezierCubic2D {
  private length: number;

  public constructor(
    public readonly p0: Vector2,
    public readonly p1: Vector2,
    public readonly p2: Vector2,
    public readonly p3: Vector2,
  ) {}

  public getPointAtPercentage(value: number): CurvePoint {
    return this.eval(value);
  }

  public getPercentageFromDistance(
    distance: number,
    iterations: number = 10,
  ): number {
    let t = 0;
    let h = distance / iterations;
    for (let i = 0; i < iterations; i++) {
      const k1 = h / this.curve.evalDerivative(t).magnitude;
      const k2 = h / this.curve.evalDerivative(t + k1 / 2).magnitude;
      const k3 = h / this.curve.evalDerivative(t + k2 / 2).magnitude;
      const k4 = h / this.curve.evalDerivative(t + k3).magnitude;
      t += (k1 + 2 * (k2 + k3) + k4) / 6;
    }
    return t;
  }

  public get arcLength(): number {
    return this.getArcLength();
  }

  @computed()
  public get curve(): Polynomial2D {
    return new Polynomial2D(
      this.p0,
      // 3*(-p0+p1)
      this.p0.flipped.add(this.p1).scale(3),
      // 3*p0-6*p1+3*p2
      this.p0.scale(3).sub(this.p1.scale(6)).add(this.p2.scale(3)),
      // -p0+3*p1-3*p2+p3
      this.p0.flipped.add(this.p1.scale(3)).sub(this.p2.scale(3)).add(this.p3),
    );
  }

  public eval(t: number): CurvePoint {
    return {
      position: this.curve.eval(t),
      tangent: this.curve.evalDerivative(t).normalized,
    };
  }

  public split(t: number): [BezierCubic2D, BezierCubic2D] {
    const a = new Vector2(
      this.p0.x + (this.p1.x - this.p0.x) * t,
      this.p0.y + (this.p1.y - this.p0.y) * t,
    );
    const b = new Vector2(
      this.p1.x + (this.p2.x - this.p1.x) * t,
      this.p1.y + (this.p2.y - this.p1.y) * t,
    );
    const c = new Vector2(
      this.p2.x + (this.p3.x - this.p2.x) * t,
      this.p2.y + (this.p3.y - this.p2.y) * t,
    );
    const d = new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    const e = new Vector2(b.x + (c.x - b.x) * t, b.y + (c.y - b.y) * t);
    const p = new Vector2(d.x + (e.x - d.x) * t, d.y + (e.y - d.y) * t);

    return [
      new BezierCubic2D(this.p0, a, d, p),
      new BezierCubic2D(p, e, c, this.p3),
    ];
  }

  public splitAtPercentage(value: number): [BezierCubic2D, BezierCubic2D] {
    return this.split(this.getPercentageFromDistance(this.arcLength * value));
  }

  public recalculate(resolution: number = 150) {
    this.length = this.getArcLength();

    if (this.length > resolution) {
      const [pre, post] = this.split(0.5);
      this.length = pre.arcLength + post.arcLength;
    }
  }

  private getArcLength(): number {
    const chordLength = this.p0.sub(this.p3).magnitude;
    const p0p1 = this.p0.sub(this.p1).magnitude;
    const p1p2 = this.p1.sub(this.p2).magnitude;
    const p2p3 = this.p2.sub(this.p3).magnitude;
    const controlNetLengths = p0p1 + p1p2 + p2p3;

    return (chordLength + controlNetLengths) / 2;
  }
}
