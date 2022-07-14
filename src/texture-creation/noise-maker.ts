import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { hexToRgba } from "@/helpers";

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
      this.directions.push(new EnhancedDOMPoint(
        Math.cos(i * 2.0 * Math.PI / 256),
        Math.sin(i * 2.0 * Math.PI / 256),
        Math.cos(i * 2.0 * Math.PI / 256),
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

  private noise(x: number, y: number, per: number) {
    const step = (dist: number) => 1 - 6*dist**5 + 15*dist**4 - 10*dist**3;
    const surflet = (gridX: number, gridY: number) => {
      const distX = Math.abs(x - gridX);
      const distY = Math.abs(y - gridY);
      const polyX = step(distX);
      const polyY = step(distY);
      const hashed = this.perms[this.perms[Math.trunc(gridX)%per] + Math.trunc(gridY)%per];
      const grad = (x-gridX)*this.directions[hashed].x + (y-gridY)*this.directions[hashed].y;
      return polyX * polyY * grad;
    }

    const intX = Math.trunc(x);
    const intY = Math.trunc(y);

    let total = 0;
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        total += surflet(intX + x, intY + y);
      }
    }

    return total;
  }

  private noise3d(x: number, y: number, z: number, per: number): number {
    const step = (dist: number) => 1 - 6*dist**5 + 15*dist**4 - 10*dist**3;
    const surflet = (gridX: number, gridY: number, gridZ: number) => {
      const distX = Math.abs(x - gridX);
      const distY = Math.abs(y - gridY);
      const distZ = Math.abs(z - gridZ);
      const polyX = step(distX);
      const polyY = step(distY);
      const polyZ = step(distZ);
      const xPerm = Math.trunc(gridX)%per;
      const yPerm = Math.trunc(gridY)%per;
      const zPerm = Math.trunc(gridZ)%per;
      const hashed = this.perms[this.perms[this.perms[xPerm] + yPerm] + zPerm];
      const grad = (x-gridX)*this.directions[hashed].x
                 + (y-gridY)*this.directions[hashed].y
                 + (z-gridZ)*this.directions[hashed].z;
      return polyX * polyY * polyZ * grad;
    }

    const intX = Math.trunc(x);
    const intY = Math.trunc(y);
    const intZ = Math.trunc(z);

    let total = 0;
    for (let z = 0; z < 2; z++) {
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          total += surflet(intX + x, intY + y, intZ + z);
        }
      }
    }

    return total;
  }

  // haggard third dimension temporarily, fix this
  private fBm(x: number, y: number, per: number, octs: number, noiseType: NoiseType, z?: number): number {
    let value = 0;
    let baseMethod;
    if (z === undefined) {
      baseMethod = (o: number) => 0.5**o * this.noise(x*2**o, y*2**o, per*2**o);
    } else {
      baseMethod = (o: number) => 0.5**o * this.noise3d(x*2**o, y*2**o, z*2**o, per*2**o);
    }
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
    colorScale = 128,
    color: string,
    isInverted = false
  ): ImageData {
    const data = [];

    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        data.push(this.fBm(x*frequency, y*frequency, Math.trunc(size*frequency), octals, noiseType));
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

  noiseImage3d(
    size: number,
    frequency: number,
    octals: number,
    noiseType: NoiseType,
    colorScale = 128,
    color: string,
    isInverted = false
  ): ImageData[] {

    const data: number[] = [];

    for (let z = 0; z < 128; z++) {
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          data.push(this.fBm(x*frequency, y*frequency, Math.trunc(size*frequency), octals, noiseType, z*frequency));
        }
      }
    }


    const [red, green, blue] = hexToRgba(color);

    const textureLayers: ImageData[] = [];
    let dataIndex = 0;

    for (let depth = 0; depth < 128; depth++) {
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

      textureLayers.push(imageData);
    }
    return textureLayers;
  }

  randomNumber(seed: number): number {
    return (Math.sin(seed * 127.1 + 123.456 * 311.7) * 43758.5453123) % 1;
  }
}

export const noiseMaker = new NoiseMaker();
