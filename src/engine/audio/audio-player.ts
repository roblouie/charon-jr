// @ts-nocheck
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export const audioCtx = new AudioContext();

type AudioPlayer = (p?: number,k?:number,b?: number,e?: number,r?: number,t?: number,q?: number,D?: number,u?: number,y?: number,v?: number,z?: number,l?: number,E?: number,A?: number,F?: number,c?: number,w?: number,m?: number,B?: number) => AudioBufferSourceNode

// zzfxV - global volume
const zzfxV=.3

// zzfxR - global sample rate
const zzfxR=44100

// zzfx() - the universal entry point -- returns a AudioBufferSourceNode
const zzfx=(...t)=>zzfxP(zzfxG(...t))

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
const zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f;return e}

// zzfxG() - the sound generator -- returns an array of sample data
const zzfxG = (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let M = Math,R=zzfxR,d=2*Math.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+ r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1: -1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/ 2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a) +1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);return k};

// zzfxX - the common audio context
const zzfxX=audioCtx;
const zzfxM=(n,f,t,e=125)=>{let l,o,z,r,g,h,x,a,u,c,d,i,m,p,G,M=0,R=[],b=[],j=[],k=0,q=0,s=1,v={},w=zzfxR/e*60>>2;for(;s;k++)R=[s=a=d=m=0],t.map((e,d)=>{for(x=f[e][k]||[0,0,0],s|=!!f[e][k],G=m+(f[e][0].length-2-!a)*w,p=d==t.length-1,o=2,r=m;o<x.length+p;a=++o){for(g=x[o],u=o==x.length+p-1&&p||c!=(x[0]||0)|g|0,z=0;z<w&&a;z++>w-99&&u?i+=(i<1)/99:0)h=(1-i)*R[M++]/2||0,b[r]=(b[r]||0)-h*q+h,j[r]=(j[r++]||0)+h*q+h;g&&(i=g%1,q=x[1]||0,(g|=0)&&(R=v[[c=x[M=0]||0,g]]=v[[c,g]]||(l=[...n[c]],l[2]*=2**((g-12)/12),g>0?zzfxG(...l):[])))}m=G});return[b,j]}


export function createPannerNode(buffer: number[]) {
  const pannerModel = 'equalpower'; // "HRTF" | "equalpower"
  const innerCone = 360;
  const outerCone = 360;
  const outerGain = 0.4;
  const distanceModel = 'linear'; // "exponential" | "inverse" | "linear"
  const maxDistance = 80;
  const refDistance = 1;
  const rollOff = 30;

  return (position: EnhancedDOMPoint) => {
    const panner = new PannerNode(audioCtx, {
      panningModel: pannerModel,
      distanceModel: distanceModel,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      orientationX: 0,
      orientationY: 0,
      orientationZ: 0,
      refDistance: refDistance,
      maxDistance: maxDistance,
      rolloffFactor: rollOff,
      coneInnerAngle: innerCone,
      coneOuterAngle: outerCone,
      coneOuterGain: outerGain
    });
    const node = zzfxP(buffer);
    node.loop = true;
    node.connect(panner).connect(audioCtx.destination);
    return node;
  }
}

function addGap(buffer: number[], seconds: number) {
  for (let i = 0; i < seconds * zzfxR; i++) {
    buffer.push(0);
  }
  return buffer;
}

// Sad Ghost 1:
const sadGhostBuffer2 = addGap(zzfxG(...[2.11,.85,100,.38,.58,.08,1,,-0.1,-0.2,350,.14,,,4,.1,.05,-0.6,.26,.17]), 0.8); // Pickup 61 - Copy 13
export const sadGhostAudio2 = createPannerNode(sadGhostBuffer2);

// Sad Ghost 2:
const sadGhostBuffer = addGap(zzfxG(...[2.11,.85,100,.25,.58,.08,1,,-0.1,-0.2,350,,,,,.1,.23,-0.6,.26,.17]), 0.8); // Pickup 61 - Copy 12
// add 1 second gap
// for (let i = 0; i < 40000; i++) {
//   sadGhostBuffer.push(0);
// }
export const sadGhostAudio = createPannerNode(sadGhostBuffer);

const ghostThankYouBuffer = zzfxG(...[2.11,.5,300,.13,.28,.08,1,,1.1,.5,200,,,,.3,.1,.23,-0.2,.18,.17]);
export const ghostThankYouAudio = createAudioNode(ghostThankYouBuffer);

// Ghost fly away?:
const ghostFlyAwayBuffer = zzfxG(...[2.11,0,101,.25,.4,.56,1,,.4,.6,270,,,,.1,.1,.43,-0.6,.26,.29]); // Pickup 61 - Copy 14
export const ghostFlyAwayAudio = createAudioNode(ghostFlyAwayBuffer);

// Ghost Woo Hoo !?
zzfx(...[2.11,.5,300,.13,.28,.08,1,,1.1,.5,200,,,,.3,.1,.23,-0.2,.18,.17]); // Pickup 61 - Copy 14

// Engine ?
zzfx(...[2.03,0,48,,2.91,-1,2,.3,,,,,.07,.3,,.1,.19,.6,,.43]); // Powerup 78

// BETTER ENGINE
const engine = zzfxG(...[2.03,0,48,,2.91,0,2,.4,,,,,.03,,,,,.6,,.59]);
export const engineAudio = zzfxP(engine);


// Possible landing sound
const landingBuffer = zzfxG(...[,,135,.01,.09,.05,1,1.7,-3.9,-1.5,,,.17,.6,,.1,,.59,.01]); // Hit 761 // Shoot 151
export const landingAudio = createAudioNode(landingBuffer);

const hit1Buffer = zzfxG(...[1.74,.2,164.8138,.01,.08,.04,4,4.4,-1,-2,-400,,,.2,,.1,.01,.5,.06,.08]); // Hit 242
export const hit1Audio = createAudioNode(hit1Buffer);

const hit2Buffer = zzfxG(...[,,243,.01,.02,.19,4,.42,-0.1,,,,,.9,,.4,,.59,.04,.03]); // Hit 251
export const hit2Audio = createAudioNode(hit2Buffer);

// Happy Ghost Thank You ?
zzfx(...[2.11,.85,101,.25,.4,.56,1,,.4,.5,270,,,,.1,.1,.43,-0.6,.26,.29]); // Pickup 61 - Copy 14


// Guitar Sound ?
zzfx(...[,,264,,.08,0,,1.99,-1.3,-5.8,1150,-0.12,-0.01,2.1,11,.1,.01,.62,.07,.33]); // Jump 85

// Cool Beat
zzfx(...[2.03,0,65.40639,.01,.34,.07,2,1.9,,,,,,,,,.16,.23,.19]); // Music 103


function createAudioNode(buffer: number[]) {
  return () => {
    const node = zzfxP(buffer)
    node.connect(audioCtx.destination);
    return node; //a
  }
}
