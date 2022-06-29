export class EnhancedDOMPoint {
  private baseValues: number[];
  private currentReturn: number[] = [];

  constructor(vals: number[]) {

  }
}

[
  'x', 'y', 'z', 'w',
  'xy', 'xz', 'xw', 'yx', 'yz', 'yw', 'zx', 'zy', 'zw', 'wx', 'wy', 'wz',
  'xyz', 'xyw', 'xzy', 'xzw', 'xwy', 'xwz',
  'yxz', 'yxw', 'yzx', 'yzw', 'ywx', 'y'
]