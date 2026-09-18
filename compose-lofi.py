import numpy as np, wave
from pathlib import Path
sr=32000; beat=60/72; length=32*beat;n=int(sr*length);mix=np.zeros((n,2));rng=np.random.default_rng(17)
def add(signal,start,amp,pan=0):
 idx=(np.arange(len(signal))+int(start*sr))%n
 mix[idx,0]+=signal*amp*np.sqrt((1-pan)/2);mix[idx,1]+=signal*amp*np.sqrt((1+pan)/2)
def note(midi,start,duration,amp,pan=0):
 t=np.arange(int(duration*sr))/sr;f=440*2**((midi-69)/12)
 env=(1-np.exp(-t/0.012))*np.exp(-t/(duration/2.8));env*=np.minimum(1,(duration-t)/.2)
 sig=(np.sin(2*np.pi*f*t+.12*np.sin(2*np.pi*f*2*t)*np.exp(-t*3))+.16*np.sin(2*np.pi*f*2*t)+.035*np.sin(2*np.pi*f*3*t))*env
 add(sig,start,amp,pan)
 for delay,level in [(.19,.13),(.37,.07),(.61,.035)]:add(sig,start+delay,amp*level,-pan)
chords=[[48,55,59,64],[48,55,59,62],[45,52,55,60],[45,52,55,59],[50,57,60,64],[50,57,60,65],[43,53,57,62],[43,53,59,62]]
melodies=[[76,None,79,74],[71,None,74,None],[72,None,76,74],[71,None,67,None],[69,None,72,76],[74,None,72,None],[71,None,69,67],[74,None,71,None]]
for bar,chord in enumerate(chords):
 for strike in [0,2.6]:
  for j,midi in enumerate(chord):note(midi,(bar*4+strike)*beat+j*.018,2.7,.067,(-.45+j*.3))
 note(chord[0]-12,bar*4*beat,1.9,.11)
 note(chord[0]-12,(bar*4+2.25)*beat,1.4,.07)
 for k,m in enumerate(melodies[bar]):
  if m is not None:note(m,(bar*4+k+.12)*beat,1.5,.045,.25)
 for b in [0,2]:
  t=np.arange(int(.24*sr))/sr;kick=np.sin(2*np.pi*(47*t+38*.025*(1-np.exp(-t/.025))))*np.exp(-t*19)*(1-np.exp(-t*300));add(kick,(bar*4+b)*beat,.14)
 for b in [1,3]:
  t=np.arange(int(.14*sr))/sr;noise=rng.normal(0,1,len(t));soft=np.convolve(noise,np.ones(12)/12,'same')*np.exp(-t*38);add(soft,(bar*4+b+.03)*beat,.043,-.15)
 for eighth in range(8):
  t=np.arange(int(.06*sr))/sr;noise=rng.normal(0,1,len(t));hat=np.diff(noise,prepend=noise[0])*np.exp(-t*95);add(hat,(bar*4+eighth*.5+(0.075 if eighth%2 else 0))*beat,.006,.4)
mix=np.tanh(mix*1.4);mix*=.68/max(abs(mix).max(),.001)
p=Path(__file__).resolve().parent.parent/'assets/lofi-evening.wav'
with wave.open(str(p),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mix*32767).astype('<i2').tobytes())
print('Original 72 BPM stereo loop:',round(length,2),'seconds; peak',round(abs(mix).max(),3))

import subprocess
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(p),"-codec:a","libmp3lame","-b:a","128k",str(p.with_suffix(".mp3"))],check=True)
p.unlink()
