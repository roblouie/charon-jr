// @ts-nocheck
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
const zzfxG=(q=1,k=.05,c=220,e=0,t=0,u=.1,r=0,F=1,v=0,z=0,w=0,A=0,l=0,B=0,x=0,G=0,d=0,y=1,m=0,C=0)=>{let b=2*Math.PI,H=v*=500*b/zzfxR**2,I=(0<x?1:-1)*b/4,D=c*=(1+2*k*Math.random()-k)*b/zzfxR,Z=[],g=0,E=0,a=0,n=1,J=0,K=0,f=0,p,h;e=99+zzfxR*e;m*=zzfxR;t*=zzfxR;u*=zzfxR;d*=zzfxR;z*=500*b/zzfxR**3;x*=b/zzfxR;w*=b/zzfxR;A*=zzfxR;l=zzfxR*l|0;for(h=e+m+t+u+d|0;a<h;Z[a++]=f)++K%(100*G|0)||(f=r?1<r?2<r?3<r?Math.sin((g%b)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/b%2+2)%2:1-4*Math.abs(Math.round(g/b)-g/b):Math.sin(g),f=(l?1-C+C*Math.sin(2*Math.PI*a/l):1)*(0<f?1:-1)*Math.abs(f)**F*q*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-y):a<e+m+t?y:a<h-d?(h-a-d)/u*y:0),f=d?f/2+(d>a?0:(a<h-d?1:(h-a)/d)*Z[a-d|0]/2):f),p=(c+=v+=z)*Math.sin(E*x-I),g+=p-p*B*(1-1E9*(Math.sin(a)+1)%2),E+=p-p*B*(1-1E9*(Math.sin(a)**2+1)%2),n&&++n>A&&(c+=w,D+=w,n=0),!l||++J%l||(c=D,v=H,n=n||1);return Z}




// zzfxX - the common audio context
const zzfxX=audioCtx;
const zzfxM=(n,f,t,e=125)=>{let l,o,z,r,g,h,x,a,u,c,d,i,m,p,G,M=0,R=[],b=[],j=[],k=0,q=0,s=1,v={},w=zzfxR/e*60>>2;for(;s;k++)R=[s=a=d=m=0],t.map((e,d)=>{for(x=f[e][k]||[0,0,0],s|=!!f[e][k],G=m+(f[e][0].length-2-!a)*w,p=d==t.length-1,o=2,r=m;o<x.length+p;a=++o){for(g=x[o],u=o==x.length+p-1&&p||c!=(x[0]||0)|g|0,z=0;z<w&&a;z++>w-99&&u?i+=(i<1)/99:0)h=(1-i)*R[M++]/2||0,b[r]=(b[r]||0)-h*q+h,j[r]=(j[r++]||0)+h*q+h;g&&(i=g%1,q=x[1]||0,(g|=0)&&(R=v[[c=x[M=0]||0,g]]=v[[c,g]]||(l=[...n[c]],l[2]*=2**((g-12)/12),g>0?zzfxG(...l):[])))}m=G});return[b,j]}



export function getAudioPlayer(): () => void {
  return zzfxP
}


const pannerModel = 'equalpower';

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
  positionX: 102,
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

const explosion = zzfxG(...[,,333,.01,0,.9,4,1.9,,,,,,.5,,.6]);

const test = zzfxP(explosion);
test.loop = true;
// test.playbackRate.value = 2;
test.connect(panner).connect(audioCtx.destination);
test.start();


// Sad Ghost 1:
zzfx(...[2.11,.85,100,.25,.58,.08,1,,-0.1,-0.2,350,,,,,.1,.23,-0.6,.26,.17]); // Pickup 61 - Copy 13

// Sad Ghost 2:
zzfx(...[2.11,.85,100,.25,.58,.08,1,,-0.1,-0.2,350,,,,1,-0.1,.23,-0.6,.26,.17]); // Pickup 61 - Copy 12

// Ghost fly away?:
zzfx(...[2.11,.85,300,.37,.56,.2,1,1.1,.2,.1,,.14,,,3,.1,.08,.6,.2,.08]); // Pickup 61 - Copy 14

// Ghost Woo Hoo !?
zzfx(...[2.11,.5,300,.13,.28,.08,1,,1.1,.5,200,,,,.3,.1,.23,-0.2,.18,.17]); // Pickup 61 - Copy 14

// Engine ?
zzfx(...[2.03,0,48,,2.91,-1,2,.3,,,,,.07,.3,,.1,.19,.6,,.43]); // Powerup 78

// BETTER ENGINE
const engine = zzfxG(...[2.03,0,48,,2.91,0,2,.4,,,,,.03,,1.5,,,.6,,.59]);
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
