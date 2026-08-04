/**
 * box-muller basic form implementation: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 *
 * u1 must be non-zero
 */
export function boxMullerSample(u1: number, u2: number): { z1: number; z2: number } {
  // z1 = Rcos(theta)
  // z2 = Rsin(theta)
  //
  // where
  //
  // R^2 = -2 * ln(u1)
  // theta = 2 * PI * u2
  const R = Math.sqrt(-2 * Math.log(u1))
  const theta = 2 * Math.PI * u2

  return {
    z1: R * Math.cos(theta),
    z2: R * Math.sin(theta),
  }
}
