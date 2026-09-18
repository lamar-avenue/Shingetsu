const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const timeline = require('../timeline.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../content.js'),'utf8'),context);
const data = context.window.STORY_DATA;
test('film runs through all scenes without a gap or manual advance',()=>{
 assert.equal(data.cues[0].start,0);
 data.cues.forEach((cue,i)=>{
  assert.ok(cue.end>cue.start);
  if(i)assert.equal(cue.start,data.cues[i-1].end);
  assert.equal(timeline.frame(data,cue.start,false).index,i);
 });
 assert.equal(data.cues.at(-1).end,data.duration);
 assert.equal(timeline.frame(data,24.999,false).cue.scene,'moment');
 assert.equal(timeline.frame(data,25,false).cue.scene,'letters');
 assert.equal(timeline.frame(data,37,false).cue.scene,'chess');
 assert.equal(timeline.frame(data,data.montageStart,false).cue.scene,'final');
});
test('seeking clamps bounds and the final frame remains visible',()=>{
 assert.equal(timeline.frame(data,-30,false).time,0);
 const end=timeline.frame(data,999,false);
 assert.equal(end.time,data.duration);assert.equal(end.ended,true);assert.equal(end.cue.scene,'final');
 assert.equal(timeline.frame(data,0,false).ended,false);
});
test('montage loops actual photos and calm mode slows the cuts',()=>{
 const withPhotos={...data,photos:[{src:'1.jpg'},{src:'2.jpg'},{src:'3.jpg'}]};
 assert.equal(timeline.frame(withPhotos,84,false).photo,-1);
 assert.equal(timeline.frame(withPhotos,85,false).photo,0);
 assert.equal(timeline.frame(withPhotos,86.3,false).photo,1);
 assert.equal(timeline.frame(withPhotos,88.7,false).photo,0);
 assert.equal(timeline.frame(withPhotos,86.3,true).photo,0);
 assert.equal(timeline.frame(withPhotos,88.6,true).photo,1);
 assert.equal(timeline.frame(data,90,false).photo,-1);
});

test('envelopes hold playback, release after three openings, and allow skipping',()=>{
 assert.equal(timeline.gateTime(data,27.9,28.1,[],false),28);
 assert.equal(timeline.gateTime(data,28,29,[0,1],false),28);
 assert.equal(timeline.gateTime(data,28,29,[0,1,2],false),29);
 assert.equal(timeline.gateTime(data,28,29,[0,0,1],false),28);
 assert.equal(timeline.gateTime(data,28,29,[],true),29);
 assert.equal(timeline.gateTime(data,38,39,[],false),39);
 assert.equal(timeline.gateTime(data,20,50,[],false),28);
});

test('playback is 15 percent faster and stops at the final frame',()=>{
 assert.equal(data.playbackRate,1.15);
 assert.equal(timeline.advanceTime(10,2,data.playbackRate,data.duration),12.3);
 assert.equal(timeline.advanceTime(115,10,data.playbackRate,data.duration),116);
 assert.equal(timeline.advanceTime(20,-1,data.playbackRate,data.duration),20);
});
