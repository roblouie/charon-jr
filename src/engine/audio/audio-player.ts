// @ts-nocheck
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export const audioCtx = new AudioContext();

// zzfxV - global volume
const zzfxV=.3

// zzfxR - global sample rate
const zzfxR=44100

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
export const zzfxP=(...t)=>{let e=audioCtx.createBufferSource(),f=audioCtx.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f;return e}

// zzfxG() - the sound generator -- returns an array of sample data
export const zzfxG = (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0): number[] =>{let d=2*Math.PI,G=u*=500*d/zzfxR/zzfxR,C=b*=(1-k+2*k*Math.random(k=[]))*d/zzfxR,g=0,H=0,a=0,n=1,I=0,J=0,f=0,x,h;e=zzfxR*e+9;m*=zzfxR;r*=zzfxR;t*=zzfxR;c*=zzfxR;y*=500*d/zzfxR**3;A*=d/zzfxR;v*=d/zzfxR;z*=zzfxR;l=zzfxR*l|0;for(h=e+m+ r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?Math.sin((g%d)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*Math.abs(Math.round(g/d)-g/d):Math.sin(g),f=(l?1-B+B*Math.sin(d*a/l):1)*(0<f?1: -1)*Math.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/ 2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*Math.cos(A*H++),g+=x-x*E*(1-1E9*(Math.sin(a) +1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);return k};

export function createPannerNode(buffer: number[]) {
  return (position: EnhancedDOMPoint) => {
    const panner = new PannerNode(audioCtx, {
      panningModel: 'equalpower',
      distanceModel: 'linear',
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      refDistance: 1,
      maxDistance: 80,
      rolloffFactor: 30,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0.4
    });
    const node = zzfxP(buffer);
    node.loop = true;
    node.connect(panner).connect(audioCtx.destination);
    return node;
  }
}

export function createAudioNode(buffer: number[]) {
  return () => {
    const node = zzfxP(buffer)
    node.connect(audioCtx.destination);
    return node;
  }
}


export function addGap(buffer: number[], seconds: number) {
  for (let i = 0; i < seconds * zzfxR; i++) {
    buffer.push(0);
  }
  return buffer;
}


