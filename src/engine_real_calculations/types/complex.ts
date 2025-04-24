export interface Complex {
  re: number;
  im: number;
}

function normalize(n: number): number {
  return Object.is(n, -0) ? 0 : n;
}

export class ComplexNum implements Complex {
  constructor(public re: number, public im: number) {
    this.re = normalize(re);
    this.im = normalize(im);
  }
  static add(a: Complex, b: Complex): Complex {
    return new ComplexNum(a.re + b.re, a.im + b.im);
  }
  static sub(a: Complex, b: Complex): Complex {
    return new ComplexNum(a.re - b.re, a.im - b.im);
  }
  static mul(a: Complex, b: Complex): Complex {
    return new ComplexNum(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  }
  static div(a: Complex, b: Complex): Complex {
    const denom = b.re * b.re + b.im * b.im;
    return new ComplexNum((a.re * b.re + a.im * b.im) / denom, (a.im * b.re - a.re * b.im) / denom);
  }
  static conj(a: Complex): Complex {
    return new ComplexNum(a.re, -a.im);
  }
  static abs2(a: Complex): number {
    return a.re * a.re + a.im * a.im;
  }
  static zero(): Complex {
    return new ComplexNum(0, 0);
  }
  static one(): Complex {
    return new ComplexNum(1, 0);
  }
  static fromReal(r: number): Complex {
    return new ComplexNum(r, 0);
  }
} 