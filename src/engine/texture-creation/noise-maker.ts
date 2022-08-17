import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { doTimes, hexToRgba } from "@/engine/helpers";

export enum NoiseType {
  Perlin,
  Turbulent,
  Edge,
  Blobs,
  Lines,
}

class NoiseMaker {
  private perms: number[] = [];
  private directions: EnhancedDOMPoint[] = [];

  constructor() {
    for (let i = 0; i < 256; i++) {
      const val = i * 2.0 * Math.PI / 256;
      this.directions.push(new EnhancedDOMPoint(
        Math.cos(val),
        Math.sin(val),
        Math.cos(val),
      ));
    }
  }

  getDirection(permsIndex: number) {
    return this.directions[this.perms[permsIndex]];
  }

  seed(seedValue: number) {
    const initialPerm: number[] = [];
    for (let i = 0; i < 256; i++) {
      initialPerm.push(i);
    }
    const shuffledPerm = this.shuffle(initialPerm, seedValue);
    this.perms = [...shuffledPerm, ...shuffledPerm];
  }

  private shuffle(array: number[], initialSeed: number) {
    let currentIndex = array.length;
    let randomIndex;
    let seed = initialSeed;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      const randomNumber = this.randomNumber(seed);
      randomIndex = Math.floor(Math.abs(randomNumber) * currentIndex);
      // Floating point math causes deviation across browsers, so change the random number to a whole number before seeding again
      seed = Math.trunc(randomNumber * 10000);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  private noise(pixelPosition: EnhancedDOMPoint, per: number) {
    const difference = new EnhancedDOMPoint();

    const step = (dist: number) => 1 - 6*dist**5 + 15*dist**4 - 10*dist**3;

    const surflet = (gridPosition: EnhancedDOMPoint) => {
      difference.subtractVectors(pixelPosition, gridPosition);
      const perm = gridPosition.modifyComponents(component => Math.trunc(component) % per);
      let hashed = this.perms[this.perms[this.perms[perm.x] + perm.y] + perm.z];

      const grad = difference.dot(this.directions[hashed]);

      const poly = difference.modifyComponents(component => step(Math.abs(component)));
      return poly.x * poly.y * poly.z * grad;
    }

    const ints = new EnhancedDOMPoint();
    const gridPos = new EnhancedDOMPoint();
    ints.set(pixelPosition).modifyComponents(Math.trunc)

    let total = 0;
    doTimes(2, z => {
      doTimes(2, y => {
        doTimes(2, x => {
          gridPos.set(ints.x + x, ints.y + y, ints.z + z);
          total += surflet(gridPos);
        })
      })
    });
    return total;
  }

  private pixelPosition = new EnhancedDOMPoint();
  private fBm(position: EnhancedDOMPoint, per: number, octs: number, noiseType: NoiseType): number {
    let value = 0;
    const baseMethod = (o: number) => 0.5**o * this.noise(this.pixelPosition.set(position.x*2**o, position.y*2**o, position.z*2**o), per*2**o);
    for (let o = 0; o < octs; o++) {
      switch (noiseType) {
        case NoiseType.Perlin:
          value += baseMethod(o);
          break;
        case NoiseType.Turbulent:
          value += Math.abs(baseMethod(o));
          break;
        case NoiseType.Edge:
          value -= Math.abs(baseMethod(o));
          break;
        case NoiseType.Blobs:
          value = baseMethod(o);
          break;
        case NoiseType.Lines:
          value = Math.abs(baseMethod(o));
          break;
      }
    }
    return value;
  }

  noiseLandscape(size: number,frequency: number, octals: number, noiseType: NoiseType, scale: number) {
    const values = [];
    const position = new EnhancedDOMPoint();
    for (let verticalPosition = 0; verticalPosition < size; verticalPosition++) {
      for (let horizontalPosition = 0; horizontalPosition < size; horizontalPosition++) {
        values.push(this.fBm(position.set(horizontalPosition * frequency, verticalPosition * frequency), Math.trunc(size * frequency), octals, noiseType) * scale);
      }
    }
    return values;
  }

  noiseImage(
    size: number,
    frequency: number,
    octals: number,
    noiseType: NoiseType,
    color: string,
    colorScale = 128,
    isInverted = false,
    horizontalDimension: "x" | "y" | "z" = 'x',
    verticalDimension: "x" | "y" | "z" = 'y',
    sliceDimension: "x" | "y" | "z" = 'z',
    slice = 0,
    flip = false): ImageData {
    const [red, green, blue] = hexToRgba(color);
    const imageData = new ImageData(size, size);
    let imageDataIndex = 0;

    const position = new EnhancedDOMPoint();
    const flipBase = size - 1;
    for (let verticalPosition = 0; verticalPosition < size; verticalPosition++) {
      for (let horizontalPosition = 0; horizontalPosition < size; horizontalPosition++) {
        position[horizontalDimension] = (flip ? flipBase - horizontalPosition : horizontalPosition) * frequency;
        position[verticalDimension] = verticalPosition * frequency;
        position[sliceDimension] = slice * frequency;

        const noiseValue = this.fBm(position, Math.trunc(size * frequency), octals, noiseType);
        const computed = noiseValue * colorScale + colorScale;
        imageData.data[imageDataIndex] = red;
        imageData.data[imageDataIndex + 1] = green;
        imageData.data[imageDataIndex + 2] = blue;
        imageData.data[imageDataIndex + 3] = isInverted ? 255 - computed : computed;
        imageDataIndex += 4;
      }
    }

    return imageData;
  }

  randomNumber(seed: number): number {
    return (Math.sin(seed * 127.1 + 38481) * 43780) % 1;
  }
}

export const noiseMaker = new NoiseMaker();
