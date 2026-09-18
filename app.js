'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const data = window.STORY_DATA;
  const timeline = window.StoryTimeline;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const key = 'shingetsu-film-v2';
  let stored = {}, canSave = true;
  try { stored = JSON.parse(localStorage.getItem(key) || localStorage.getItem('shingetsu-story-v1') || '{}') || {}; } catch { canSave = false; }
  const state = {
    version: 5,
    theme: ['night','amber','dusk','morning'].includes(stored.theme) ? stored.theme : 'night',
    opened: stored.version === 5 && Array.isArray(stored.opened) ? stored.opened.filter(i => [0,1,2].includes(i)) : [],
    skipped: stored.version === 5 && stored.skipped === true,
    calm: reduced,
    volume: Number.isFinite(stored.volume) ? Math.max(0,Math.min(1,stored.volume)) : .65,
    sound: stored.sound === true,
    time: stored.version === 5 ? timeline.clampTime(stored.time, data.duration) : 0,
  };
  let playing = false, started = false, currentCue = -1, currentPhoto = -2, lastTick = 0, lastSaved = -1;
  let audioRevision = 0, mediaClock = false;
  const music = $('#music');
  let musicFade;
  function lettersHeld() { return state.time >= data.envelopeGate && state.time < data.envelopeEnd && !state.skipped && ![0,1,2].every(i=>state.opened.includes(i)); }
  let resumeAfterSettings = false;
  const voice = $('#voice');
  if (data.narration) voice.src = data.narration;
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { canSave = false; }
    $('#storageNote').hidden = canSave;
  }
  let noticeTimer;
  function notice(text) { clearTimeout(noticeTimer); $('#notice').textContent = text; $('#notice').hidden = false; noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, 6500); }
  function settingsUI() {
    document.body.dataset.theme = state.theme;
    document.body.dataset.motion = state.calm ? 'calm' : 'full';
    $$('input[name="theme"]').forEach(input => { input.checked = input.value === state.theme; });
    $('#themeSelect').value = state.theme;
    $('#setupSound').checked = $('#audioToggle').checked = state.sound;
    $('#muteLine').hidden = state.sound;
    $('#soundButton').setAttribute('aria-label', state.sound ? 'Выключить звук' : 'Включить звук');
    $('#soundButton').title = state.sound ? 'Выключить звук' : 'Включить звук';
    voice.muted = !state.sound;
    voice.volume = state.volume;
    const volume = Math.round(state.volume*100);
    $('#volumeRange').value = $('#volumeSettings').value = volume;
    $('#volumeValue').textContent = $('#volumeSettingsValue').textContent = `${volume}%`;
    $('#volumeRange').setAttribute('aria-valuetext', `${volume} процентов`);
    $('#volumeSettings').setAttribute('aria-valuetext', `${volume} процентов`);
    $('#storageNote').hidden = canSave;
  }
  function ambientLevel() {
    cancelAnimationFrame(musicFade);
    const target = playing && state.sound ? state.volume * (data.narration ? .23 : .58) : 0;
    const from = music.volume, begin = performance.now();
    function fade(now) {
      const t = Math.min(1,(now-begin)/450);
      music.volume = from+(target-from)*t;
      if(t<1)musicFade=requestAnimationFrame(fade);
      else if(!target)music.pause();
    }
    musicFade=requestAnimationFrame(fade);
  }
  async function prepareAmbient() {
    if (!state.sound || !playing) return;
    try { await music.play(); ambientLevel(); }
    catch (error) { notice(error.name==='NotAllowedError'?'Нажми кнопку звука, чтобы разрешить воспроизведение.':'Не удалось загрузить музыку. Проверь, что lofi-evening.mp3 загружен рядом с index.html.'); }
  }
  music.volume=0;
  function setSound(on) { if(on && state.volume===0)state.volume=.65; state.sound = on; settingsUI(); save(); if (playing) prepareAmbient(); ambientLevel(); }
  function formatTime(seconds) { const value = Math.floor(seconds); return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`; }
  function playerUI() {
    ['momentText','lettersText','chessText','finalText'].forEach(id => {
      const animation = document.getElementById(id)._animation;
      if (!animation) return;
      if (!playing && animation.playState === 'running') animation.pause();
      if (playing && animation.playState === 'paused') animation.play();
    });
    $('#pauseIcon').textContent = playing ? 'Ⅱ' : '▶';
    $('#pauseButton').setAttribute('aria-label', playing ? 'Пауза' : state.time >= data.duration ? 'Посмотреть ещё раз' : 'Продолжить');
    $('#film').classList.toggle('paused', !playing);
    $('#progress').value = state.time;
    $('#timeLabel').textContent = `${formatTime(state.time/data.playbackRate)} / ${formatTime(data.duration/data.playbackRate)}`;
  }
  function pause() { playing = false; audioRevision++; voice.pause(); mediaClock = false; ambientLevel(); playerUI(); save(); }
  async function play() {
    if (playing) return;
    if (state.time >= data.duration) state.time = 0;
    playing = true; lastTick = performance.now(); const revision = ++audioRevision;
    render(); playerUI(); prepareAmbient();
    if (data.narration && !voice.error && !lettersHeld()) {
      try {
        voice.currentTime = state.time;
        voice.playbackRate = data.playbackRate;
        voice.preservesPitch = true;
        voice.muted = !state.sound;
        await voice.play();
        if (!playing || revision !== audioRevision) { voice.pause(); return; }
        mediaClock = true;
      } catch { mediaClock = false; if (playing) notice('Не удалось включить запись. История идёт с текстом.'); }
    }
  }
  voice.addEventListener('error', () => { mediaClock = false; if (started) notice('Запись недоступна. История продолжится с текстом.'); });
  voice.addEventListener('ended', () => { mediaClock = false; lastTick = performance.now(); });
  function begin(fromStart = false) {
    if (fromStart || state.time >= data.duration) { state.time = 0; state.opened=[]; state.skipped=false; letterUI(); }
    started = true; $('#setup').hidden = true; $('#film').hidden = false; $('#player').hidden = false;
    window.scrollTo({top:0,behavior:'instant'}); play(); $('#pauseButton').focus({preventScroll:true});
  }
  function seek(value) {
    state.time = timeline.clampTime(value, data.duration);
    if (data.narration && !voice.error) { try { voice.currentTime = state.time; } catch {} }
    lastTick = performance.now(); render(); playerUI(); save();
    if (state.time >= data.duration) pause();
  }
  const board = $('#board');
  const lines = $('.board-lines');
  for (let y=0;y<8;y++) for (let x=0;x<8;x++) { const el=document.createElement('span'); el.className='square'+((x+y)%2?' dark':''); el.setAttribute('aria-hidden','true'); board.insertBefore(el,lines); }
  const chess = window.StoryChess;
  chess.configure(data.cues);
  const glyphs = {k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  const pieces = chess.initial.map(([id,type])=>{
    const el=document.createElement('span');el.className='piece'+(id[0]==='b'?' black':'');
    el.textContent=glyphs[type];el.setAttribute('aria-hidden','true');board.append(el);return {id,el};
  });
  let lastMove=-2;
  function boardFrame(cue,time){
    const frame=chess.positionAt(time,state.calm);
    frame.pieces.forEach(p=>{const el=pieces.find(item=>item.id===p.id).el;el.hidden=!p.visible;el.style.left=`${p.x*12.5}%`;el.style.top=`${p.y*12.5}%`;});
    if(frame.active===lastMove)return;lastMove=frame.active;
    const move=frame.move;
    const from=move?chess.xy(move.from):[-1,-1],to=move?chess.xy(move.to):[-1,-1];
    $$('.square').forEach((el,i)=>{el.classList.remove('regret');el.classList.toggle('last',i===from[1]*8+from[0]||i===to[1]*8+to[0]);});
    $('#threatLine').setAttribute('d','');$('#moveLine').setAttribute('d','');
    $('#boardNote').textContent=move?`${move.side==='w'?'Белые':'Чёрные'}: ${move.from} → ${move.to}. ${move.note}`:'История уже началась. Посмотрим, что будет дальше.';
    board.setAttribute('aria-label','Шахматная сцена. '+$('#boardNote').textContent);
  }
  const brokenPhotos=new Set();
  let activePhotoSlot=0;
  function montageFrame(photoIndex) {
    if (photoIndex===currentPhoto) return;
    currentPhoto=photoIndex;
    if(photoIndex<0) { $('#photoA').classList.remove('visible');$('#photoB').classList.remove('visible'); return; }
    const photo=data.photos[photoIndex];
    if(!photo || brokenPhotos.has(photo.src))return;
    const target=activePhotoSlot===0?$('#photoA'):$('#photoB');
    const previous=activePhotoSlot===0?$('#photoB'):$('#photoA');
    const expected=photoIndex;
    target.onload=()=>{ if(currentPhoto!==expected)return;target.classList.add('visible');previous.classList.remove('visible');activePhotoSlot=1-activePhotoSlot; };
    target.onerror=()=>{brokenPhotos.add(photo.src);target.classList.remove('visible');};
    target.src=photo.src;target.alt=photo.caption||'';
  }
  function setText(el,text) {
    if (el._animation) el._animation.cancel();
    el.textContent=text;
    if(!state.calm && el.animate) el._animation=el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:1100,easing:'ease-out',fill:'both'});
  }
  function render() {
    const frame=timeline.frame(data,state.time,state.calm);
    if(frame.index!==currentCue){
      currentCue=frame.index;
      ['moment','letters','chess','final'].forEach(name=>{$(`#${name}Scene`).hidden=name!==frame.cue.scene;});
      $('#chapterName').textContent={moment:'',letters:'Три сюрприза',chess:'Следующий ход',final:'Продолжение'}[frame.cue.scene];
      setText($(`#${frame.cue.scene}Text`),frame.cue.text);
    }
    if(frame.cue.scene==='chess')boardFrame(frame.cue,state.time);
    if(frame.cue.scene==='final')montageFrame(frame.photo);
    $('#endActions').hidden=!frame.ended;
    $('#film').classList.toggle('ended',frame.ended);
    if(frame.ended && playing) pause();
  }
  function tick(now) {
    if(playing){
      const elapsed=Math.max(0,(now-lastTick)/1000);
      const next=timeline.clampTime(mediaClock?voice.currentTime:timeline.advanceTime(state.time,elapsed,data.playbackRate,data.duration),data.duration);
      state.time=timeline.gateTime(data,state.time,next,state.opened,state.skipped);
      if(lettersHeld() && mediaClock){voice.pause();mediaClock=false;}
      render();playerUI();
      if(Math.floor(state.time)!==lastSaved){lastSaved=Math.floor(state.time);save();}
    }
    lastTick=now;requestAnimationFrame(tick);
  }
  $('#startButton').addEventListener('click',()=>begin());
  $('#restartStart').addEventListener('click',()=>begin(true));
  $('#pauseButton').addEventListener('click',()=>playing?pause():play());
  $('#replayButton').addEventListener('click',()=>{state.opened=[];state.skipped=false;letterUI();seek(0);play();});
  $('#replaySmall').addEventListener('click',()=>{state.opened=[];state.skipped=false;letterUI();seek(0);play();});
  $('#progress').max=data.duration;
  $('#progress').addEventListener('input',event=>seek(event.target.value));
  $('#home').addEventListener('click',event=>{event.preventDefault();pause();started=false;$('#film').hidden=true;$('#player').hidden=true;$('#setup').hidden=false;updateStart();});
  function setVolume(value) {
    state.volume = Math.max(0,Math.min(1,Number(value)/100));
    state.sound = state.volume > 0; settingsUI(); save();
    if(playing && state.sound && music.paused)prepareAmbient();
    ambientLevel();
  }
  $('#volumeRange').addEventListener('input',event=>setVolume(event.target.value));
  $('#volumeSettings').addEventListener('input',event=>setVolume(event.target.value));
  $('#soundButton').addEventListener('click',()=>setSound(!state.sound));
  $('#setupSound').addEventListener('change',event=>setSound(event.target.checked));
  $('#audioToggle').addEventListener('change',event=>setSound(event.target.checked));
  function setTheme(value){state.theme=value;settingsUI();save();}
  $$('input[name="theme"]').forEach(input=>input.addEventListener('change',()=>setTheme(input.value)));
  $('#themeSelect').addEventListener('change',event=>setTheme(event.target.value));
  $('#settingsButton').addEventListener('click',()=>{resumeAfterSettings=playing;pause();$('#settings').showModal();});
  $('#closeSettings').addEventListener('click',()=>$('#settings').close());
  $('#settings').addEventListener('close',()=>{if(resumeAfterSettings&&started)play();resumeAfterSettings=false;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(playing)pause();surpriseVideo.pause();}});
  window.addEventListener('pagehide',()=>{pause();});
  document.addEventListener('keydown',event=>{
    if(!started||$('#settings').open||videoDialog.open||event.code!=='Space'||['INPUT','SELECT','BUTTON','A'].includes(event.target.tagName))return;
    event.preventDefault();playing?pause():play();
  });
  function letterUI() {
    $$('[data-envelope]').forEach(button=>{
      const id=Number(button.dataset.envelope), open=state.opened.includes(id);
      button.classList.toggle('opened',open);
    });
    const count=new Set(state.opened).size;
    $('#skipLetters').hidden=count===3;
  }
  function releaseLetters() {
    if(playing && data.narration){playing=false;play();}
    lastTick=performance.now();save();
  }
  const videoDialog=$('#videoDialog'), surpriseVideo=$('#surpriseVideo');
  let resumeAfterVideo=false;
  function openVideo(id){
    resumeAfterVideo=playing;pause();
    surpriseVideo.src=`surprise-0${id+1}.mp4`;
    surpriseVideo.volume=state.volume;surpriseVideo.muted=!state.sound;
    $('#videoTitle').textContent=['Первый сюрприз','Второй сюрприз','Третий сюрприз'][id];
    $('#videoError').hidden=true;videoDialog.showModal();
    surpriseVideo.onloadedmetadata=()=>{surpriseVideo.style.aspectRatio=`${surpriseVideo.videoWidth} / ${surpriseVideo.videoHeight}`;};
    surpriseVideo.play().catch(()=>{notice('Нажми ▶ в видео, чтобы начать просмотр.');});
  }
  $('#closeVideo').addEventListener('click',()=>videoDialog.close());
  surpriseVideo.addEventListener('error',()=>{$('#videoError').hidden=false;});
  videoDialog.addEventListener('close',()=>{
    surpriseVideo.pause();surpriseVideo.removeAttribute('src');surpriseVideo.load();
    if(resumeAfterVideo&&started)play();resumeAfterVideo=false;
  });
  $$('[data-envelope]').forEach(button=>button.addEventListener('click',()=>{
    const id=Number(button.dataset.envelope);
    openVideo(id);
    if(!state.opened.includes(id))state.opened.push(id);
    letterUI();save();
    if(state.opened.length===3)releaseLetters();
  }));
  $('#skipLetters').addEventListener('click',()=>{state.skipped=true;seek(data.envelopeEnd);releaseLetters();if(!playing&&state.time<data.duration)play();});
  function updateStart(){const resume=state.time>1&&state.time<data.duration;$('#startButton').innerHTML=resume?'<span aria-hidden="true">▶</span> Продолжить историю':'<span aria-hidden="true">▶</span> Смотреть историю';$('#restartStart').hidden=!resume;}
  $('#lettersScene').append($('#endActions'));
  $('#finalScene').classList.toggle('has-photos', data.photos.length > 0);
  letterUI();settingsUI();updateStart();render();playerUI();requestAnimationFrame(tick);
})();
