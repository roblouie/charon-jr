// Sad Ghost 1:
import { addGap, createAudioNode, createPannerNode, zzfxG, zzfxP } from '@/engine/audio/audio-player';

const sadGhostBuffer2 = addGap(zzfxG(...[2.11,.85,100,.38,.58,.08,1,,-0.1,-0.2,350,.14,,,4,.1,.05,-0.6,.26,.17]), 0.8);
export const sadGhostAudio2 = createPannerNode(sadGhostBuffer2);

const sadGhostBuffer = addGap(zzfxG(...[2.11,.85,100,.25,.58,.08,1,,-0.1,-0.2,350,,,,,.1,.23,-0.6,.26,.17]), 0.8);
export const sadGhostAudio = createPannerNode(sadGhostBuffer);

const ghostThankYouBuffer = zzfxG(...[2.11,0,300,.13,.28,.08,1,,1.1,.5,200,,,,.3,.1,.23,-0.2,.18,.17]);
export const ghostThankYouAudio = createAudioNode(ghostThankYouBuffer);

const ghostFlyAwayBuffer = zzfxG(...[2.11,0,101,.25,.4,.56,1,,.4,.6,270,,,,.1,.1,.43,-0.6,.26,.29]);
export const ghostFlyAwayAudio = createAudioNode(ghostFlyAwayBuffer);

const engine = zzfxG(...[2.03,0,48,,9,0,2,.4,,,,,.03,,,,,.6,,.59]);
export const engineAudio = zzfxP(engine);

const drivingThroughWaterBuffer = zzfxG(...[.8,0,109,,2.91,0,4,0,,,,,,,-5,.2,.01,.4]);
export const drivingThroughWaterAudio = zzfxP(drivingThroughWaterBuffer);

const landingBuffer = zzfxG(...[,,135,.01,.09,.05,1,1.7,-3.9,-1.5,,,.17,.6,,.1,,.59,.01]);
export const landingAudio = createAudioNode(landingBuffer);

const coinBuffer = zzfxG(...[0.8,0,1123,,.05,.18,,.73,.5,-2.3,187,.09,,,,.1,,.54,.01]);
export const coinAudio = createAudioNode(coinBuffer);
