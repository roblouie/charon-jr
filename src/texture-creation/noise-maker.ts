import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { doTimes, hexToRgba } from "@/helpers";

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
      const randomVec = this.randomNumber(seed);
      randomIndex = Math.floor(Math.abs(randomVec) * currentIndex);
      seed = randomVec;
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  private noise(pixelPosition: EnhancedDOMPoint, per: number) {
    const difference = new EnhancedDOMPoint();
    const gridPos = new EnhancedDOMPoint();

    const step = (dist: number) => 1 - 6*dist**5 + 15*dist**4 - 10*dist**3;

    const surflet = (gridPosition: EnhancedDOMPoint) => {
      difference.subtractVectors(pixelPosition, gridPosition);
      const perm = gridPosition.modifyComponents(component => Math.trunc(component) % per);
      let hashed = this.perms[this.perms[this.perms[perm.x] + perm.y] + perm.z];

      const grad = difference.dot(this.directions[hashed]);

      const poly = difference.modifyComponents(component => step(Math.abs(component)));
      return poly.x * poly.y * poly.z * grad;
    }

    const intX = Math.trunc(pixelPosition.x);
    const intY = Math.trunc(pixelPosition.y);
    const intZ = Math.trunc(pixelPosition.z);

    let total = 0;
    doTimes(2, z => {
      doTimes(2, y => {
        doTimes(2, x => {
          gridPos.set(intX + x, intY + y, intZ + z);
          total += surflet(gridPos);
        })
      })
    });
    return total;
  }

  private pixelPosition = new EnhancedDOMPoint();
  private fBm(x: number, y: number, z: number, per: number, octs: number, noiseType: NoiseType): number {
    let value = 0;
    const baseMethod = (o: number) => 0.5**o * this.noise(this.pixelPosition.set(x*2**o, y*2**o, z*2**o), per*2**o);
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

  noiseImage(
    size: number,
    frequency: number,
    octals: number,
    noiseType: NoiseType,
    color: string,
    colorScale = 128,
    zSlice = 0,
    isInverted = false
  ): ImageData {
    const data = [];

    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        data.push(this.fBm(x * frequency, y * frequency, zSlice * frequency, Math.trunc(size * frequency), octals, noiseType));
      }
    }

    const [red, green, blue] = hexToRgba(color);

    let dataIndex = 0;
    const imageData = new ImageData(128, 128);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const raw = data[dataIndex];
      const computed = raw * colorScale + colorScale;
      imageData.data[i] = red;
      imageData.data[i + 1] = green;
      imageData.data[i + 2] = blue;
      imageData.data[i + 3] = isInverted ? 255 - computed : computed;
      dataIndex++;
    }

    return imageData;
  }

  randomNumber(seed: number): number {
    return (Math.sin(seed * 127.1 + 123.456 * 311.7) * 43758.5453123) % 1;
  }
}

export const noiseMaker = new NoiseMaker();
