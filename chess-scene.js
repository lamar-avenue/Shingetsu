/* Composed middlegame: twelve legal alternating half-moves, including a retreat
   and an exchange. It is a story about continuing, not a contest between a couple. */
(function(root){
 const initial = [
 ['wk','k','g1'],['wq','q','d1'],['wr','r','f1'],['wb','b','c4'],['wn','n','f3'],['we','p','e4'],['wg','p','g2'],['wh','p','h2'],
 ['bk','k','g8'],['bq','q','d8'],['br','r','f8'],['bb','b','c8'],['bn','n','c6'],['bd','p','d6'],['be','p','e5'],['bf','p','f7'],['bg','p','g7'],['bh','p','h7']
 ];
 const moves = [
 ['f3','h4','Поспешный шаг.'],['g7','g6','Позиция становится теснее.'],
 ['h4','f3','Иногда нужно отступить.'],['d8','e7','И увидеть всю доску.'],
 ['f1','e1','Собраться с мыслями.'],['c8','e6','История не останавливается.'],
 ['c4','b3','Найти другой путь.'],['c6','d4','Позиция снова меняется.'],
 ['f3','d4','Решиться на следующий шаг.'],['e5','d4','Принять его последствия.'],
 ['d1','f3','Поддержать то, что важно.'],['d6','d5','Продолжение всё ещё впереди.']
 ].map(([from,to,note],i)=>({from,to,note,start:null,duration:2.4,side:i%2?'b':'w'}));
 function configure(cues){
  const lines=cues.filter(cue=>cue.scene==='chess');
  if(lines.length!==moves.length)throw new Error('Every chess move needs one text cue');
  moves.forEach((move,i)=>{move.start=lines[i].start;move.duration=Math.min(2.4,(lines[i].end-lines[i].start)*.65);});
 }
 const xy=s=>[s.charCodeAt(0)-97,8-Number(s[1])];
 function positionAt(time,calm=false){
  const pieces=initial.map(([id,type,square])=>({id,type,side:id[0],square,visible:true,...Object.fromEntries(['x','y'].map((k,i)=>[k,xy(square)[i]]))}));
  let active=-1;
  for(let i=0;i<moves.length;i++){
   const move=moves[i];if(time<move.start)break;active=i;
   const piece=pieces.find(p=>p.visible&&p.square===move.from);
   const target=pieces.find(p=>p.visible&&p.square===move.to);
   const a=xy(move.from),b=xy(move.to);
   const raw=Math.max(0,Math.min(1,(time-move.start)/move.duration));
   const t=calm?(raw>=1?1:0):raw*raw*(3-2*raw);
   piece.x=a[0]+(b[0]-a[0])*t;piece.y=a[1]+(b[1]-a[1])*t;
   if(raw<1)break;
   if(target)target.visible=false;
   piece.square=move.to;
  }
  return {pieces,active,move:moves[active]||null};
 }
 const api={initial,moves,xy,positionAt,configure};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StoryChess=api;
})(typeof window==='undefined'?globalThis:window);
