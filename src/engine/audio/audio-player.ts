// @ts-nocheck
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';

export const audioCtx = new AudioContext();

// zzfxV - global volume
const zzfxV=.3

// zzfxR - global sample rate
const zzfxR=44100

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
const zzfxP=(...t)=>{let e=audioCtx.createBufferSource(),f=audioCtx.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f;return e}

// zzfxG() - the sound generator -- returns an array of sample data
const zzfxG = (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let M = Math,R=zzfxR,d=2*Math.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+ r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1: -1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/ 2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a) +1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);return k};

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
export const sadGhostAudio = createPannerNode(sadGhostBuffer);

const ghostThankYouBuffer = zzfxG(...[2.11,0,300,.13,.28,.08,1,,1.1,.5,200,,,,.3,.1,.23,-0.2,.18,.17]);
export const ghostThankYouAudio = createAudioNode(ghostThankYouBuffer);

// Ghost fly away?:
const ghostFlyAwayBuffer = zzfxG(...[2.11,0,101,.25,.4,.56,1,,.4,.6,270,,,,.1,.1,.43,-0.6,.26,.29]); // Pickup 61 - Copy 14
export const ghostFlyAwayAudio = createAudioNode(ghostFlyAwayBuffer);

const engine = zzfxG(...[2.03,0,48,,9,0,2,.4,,,,,.03,,,,,.6,,.59]);
export const engineAudio = zzfxP(engine);

const drivingThroughWaterBuffer = zzfxG(...[.8,0,109,,2.91,0,4,0,,,,,,,-5,.2,.01,.4]);
export const drivingThroughWaterAudio = zzfxP(drivingThroughWaterBuffer);

const landingBuffer = zzfxG(...[,,135,.01,.09,.05,1,1.7,-3.9,-1.5,,,.17,.6,,.1,,.59,.01]); // Hit 761 // Shoot 151
export const landingAudio = createAudioNode(landingBuffer);

const coinBuffer = zzfxG(...[0.8,0,1123,,.05,.18,,.73,.5,-2.3,187,.09,,,,.1,,.54,.01]);
export const coinAudio = createAudioNode(coinBuffer);


function createAudioNode(buffer: number[]) {
  return () => {
    const node = zzfxP(buffer)
    node.connect(audioCtx.destination);
    return node;
  }
}
