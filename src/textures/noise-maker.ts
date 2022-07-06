import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';

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
        Math.sin(i * 2.0 * Math.PI / 256)
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
    const surflet = (gridX: number, gridY: number) => {
      const distX = Math.abs(x - gridX);
      const distY = Math.abs(y - gridY);
      const polyX = 1 - 6*distX**5 + 15*distX**4 - 10*distX**3;
      const polyY = 1 - 6*distY**5 + 15*distY**4 - 10*distY**3;
      const hashed = this.perms[this.perms[Math.trunc(gridX)%per] + Math.trunc(gridY)%per];
      const grad = (x-gridX)*this.directions[hashed].x + (y-gridY)*this.directions[hashed].y;
      return polyX * polyY * grad;
    }

    const intX = Math.trunc(x);
    const intY = Math.trunc(y);
    return (surflet(intX, intY) + surflet(intX+1, intY) +
      surflet(intX, intY+1) + surflet(intX+1, intY+1));

  }

  private fBm(x: number, y: number, per: number, octs: number, noiseType: NoiseType): number {
    let value = 0;
    const baseMethod = (o: number) => 0.5**o * this.noise(x*2**o, y*2**o, per*2**o);
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
    red = 255, green = 255, blue = 255,
    isInverted = false
  ): ImageData {
    const data = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        data.push(this.fBm(x*frequency, y*frequency, Math.trunc(size*frequency), octals, noiseType));
      }
    }

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

  randomVector(seed: EnhancedDOMPoint): EnhancedDOMPoint{
    const dotVector = new EnhancedDOMPoint(seed.dot(new EnhancedDOMPoint(127.1,311.7)), seed.dot(new EnhancedDOMPoint(269.5,183.3)));
    dotVector.x = (Math.sin(dotVector.x) * 43758.5453123) % 1;
    dotVector.y = (Math.sin(dotVector.y) * 43758.5453123) % 1;
    return dotVector;
  }

  randomNumber(seed: number): number {
    return this.randomVector(new EnhancedDOMPoint(seed, 123.456)).x;
  }
}

export const noiseMaker = new NoiseMaker();
