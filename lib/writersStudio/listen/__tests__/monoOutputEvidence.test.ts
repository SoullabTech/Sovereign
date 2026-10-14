import { describe, it, expect } from 'vitest';
import { verifyMonoOutput } from '../monoOutputEvidence';
const mono={destinationChannels:1,channelCountMode:'explicit',audioTrackCount:1,trackKind:'audio',trackReadyState:'live',reportedChannels:undefined};
describe('mono routing evidence without fabricated track metadata',()=>{
 it('accepts an explicitly mono live graph when WebAudio settings are absent',()=>expect(verifyMonoOutput(mono)).toBe('explicit-audio-graph'));
 it('prefers genuine channel metadata when available',()=>expect(verifyMonoOutput({...mono,reportedChannels:1})).toBe('track-settings'));
 for(const count of [0,2,6,NaN])it('rejects contradictory reported channel count '+count,()=>expect(()=>verifyMonoOutput({...mono,reportedChannels:count})).toThrow('non-mono'));
 it('never accepts an unconfigured graph just because metadata is missing',()=>expect(()=>verifyMonoOutput({...mono,destinationChannels:2})).toThrow('one live mono'));
 it('rejects an implicit mixing mode',()=>expect(()=>verifyMonoOutput({...mono,channelCountMode:'max'})).toThrow());
 it('rejects missing or multiple audio tracks',()=>{expect(()=>verifyMonoOutput({...mono,audioTrackCount:0})).toThrow();expect(()=>verifyMonoOutput({...mono,audioTrackCount:2})).toThrow();});
 it('rejects an ended or nonaudio track',()=>{expect(()=>verifyMonoOutput({...mono,trackReadyState:'ended'})).toThrow();expect(()=>verifyMonoOutput({...mono,trackKind:'video'})).toThrow();});
});
