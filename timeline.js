(function (root) {
  'use strict';
  function clampTime(value, duration) { return Math.max(0, Math.min(duration, Number(value) || 0)); }
  function cueAt(cues, time) { return cues.findIndex((cue, i) => time >= cue.start && (time < cue.end || i === cues.length - 1)); }
  function frame(data, time, calm) {
    const t = clampTime(time, data.duration);
    const index = Math.max(0, cueAt(data.cues, t));
    const interval = calm ? Math.max(3.5, data.photoInterval) : Math.max(0.85, data.photoInterval);
    return { time: t, index, cue: data.cues[index], photo: data.photos.length && t >= data.montageStart ? Math.floor((t - data.montageStart) / interval) % data.photos.length : -1, ended: t >= data.duration };
  }
  function gateTime(data, previous, next, opened, skipped) {
    const complete = Array.isArray(opened) && [0,1,2].every(i => opened.includes(i));
    if (!skipped && !complete && previous < data.envelopeEnd && next >= data.envelopeGate) return data.envelopeGate;
    return next;
  }
  function advanceTime(time, delta, rate, duration) { return clampTime(time + Math.max(0, delta) * rate, duration); }
  const api = { clampTime, cueAt, frame, gateTime, advanceTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StoryTimeline = api;
})(typeof window === 'undefined' ? globalThis : window);
