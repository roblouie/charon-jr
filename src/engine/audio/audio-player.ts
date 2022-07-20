// @ts-nocheck
export const audioCtx = new AudioContext();

type AudioPlayer = (p?: number,k?:number,b?: number,e?: number,r?: number,t?: number,q?: number,D?: number,u?: number,y?: number,v?: number,z?: number,l?: number,E?: number,A?: number,F?: number,c?: number,w?: number,m?: number,B?: number) => AudioBufferSourceNode

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.1.7 ~ 900 bytes minified
const zzfxV=.3 // volume
export function getAudioPlayer(): AudioPlayer {
  const zzfx=    // play sound
  (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0)=>{let
    M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0
    ,J=0,f=0,x,h;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+
    r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1)
    ,-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:
    -1)*M.abs(f)**D*p*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/
    2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin(a)
    +1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);p=audioCtx.createBuffer(1,h,R);p.
  getChannelData(0).set(k);b=audioCtx.createBufferSource();b.buffer=p;return b};

  return zzfx;
}

const pannerModel = 'HRTF';

const innerCone = 360;
const outerCone = 360;
const outerGain = 0.4;

const distanceModel = 'linear';

const maxDistance = 80;

const refDistance = 1;

const rollOff = 30;


// let's use the class method for creating our panner node and pass in all those parameters we've set.

export const panner = new PannerNode(audioCtx, {
  panningModel: pannerModel,
  distanceModel: distanceModel,
  positionX: -5,
  positionY: 0,
  positionZ: 0,
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
