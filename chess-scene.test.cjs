const test=require('node:test');const assert=require('node:assert/strict');const chess=require('../chess-scene.js');
const vm=require('node:vm'),fs=require('node:fs');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../content.js'),'utf8'),context);
const data=context.window.STORY_DATA;chess.configure(data.cues);
function xy(s){return [s.charCodeAt(0)-97,Number(s[1])-1];}
function reaches(piece,to,board,attack=false){
 const [x,y]=xy(piece.square),[tx,ty]=xy(to),dx=tx-x,dy=ty-y;
 if(!dx&&!dy)return false;
 const ax=Math.abs(dx),ay=Math.abs(dy);
 if(piece.type==='n')return ax*ay===2;
 if(piece.type==='k')return Math.max(ax,ay)===1;
 if(piece.type==='p'){
  const step=piece.side==='w'?1:-1;
  if(attack)return ax===1&&dy===step;
  if(ax===1&&dy===step)return !!board.find(p=>p.square===to&&p.side!==piece.side);
  if(dx!==0||board.some(p=>p.square===to))return false;
  return dy===step;
 }
 if(piece.type==='b'&&ax!==ay)return false;
 if(piece.type==='r'&&dx!==0&&dy!==0)return false;
 if(piece.type==='q'&&dx!==0&&dy!==0&&ax!==ay)return false;
 for(let n=1;n<Math.max(ax,ay);n++){
  const square=String.fromCharCode(97+x+Math.sign(dx)*n)+(y+Math.sign(dy)*n+1);
  if(board.some(p=>p.square===square))return false;
 }
 return true;
}
function checked(side,board){const king=board.find(p=>p.side===side&&p.type==='k');return board.some(p=>p.side!==side&&reaches(p,king.square,board,true));}
test('twelve alternating moves are legal and neither side moves through check',()=>{
 let board=chess.initial.map(([id,type,square])=>({id,type,square,side:id[0]}));
 assert.equal(checked('w',board),false);assert.equal(checked('b',board),false);
 assert.equal(chess.moves.length,12);
 for(const [i,move] of chess.moves.entries()){
  const piece=board.find(p=>p.square===move.from);assert.ok(piece,move.from);
  assert.equal(piece.side,i%2?'b':'w');assert.equal(move.side,piece.side);
  const victim=board.find(p=>p.square===move.to);
  if(victim){assert.notEqual(victim.side,piece.side);assert.notEqual(victim.type,'k');}
  assert.ok(reaches(piece,move.to,board),`${move.from}-${move.to}`);
  board=board.filter(p=>p!==victim);piece.square=move.to;
  assert.equal(checked(piece.side,board),false,`self-check after ${move.from}-${move.to}`);
 }
});
test('seeking rebuilds captures and restores the original position',()=>{
 const end=chess.positionAt(85);
 assert.equal(end.pieces.filter(p=>!p.visible).length,2);
 assert.equal(end.pieces.find(p=>p.id==='wq').square,'f3');
 assert.equal(end.pieces.find(p=>p.id==='bd').square,'d5');
 assert.equal(chess.positionAt(37).pieces.filter(p=>!p.visible).length,0);
 assert.deepEqual(chess.positionAt(55),chess.positionAt(55));
});

test('each move begins exactly when its new text line appears',()=>{
 const lines=data.cues.filter(cue=>cue.scene==='chess');
 assert.equal(lines.length,12);
 lines.forEach((cue,i)=>{
  assert.equal(chess.moves[i].start,cue.start);
  assert.equal(chess.positionAt(cue.start).active,i);
  assert.equal(chess.positionAt(cue.start-.001).active,i-1);
  assert.ok(chess.moves[i].start+chess.moves[i].duration<cue.end);
 });
});
