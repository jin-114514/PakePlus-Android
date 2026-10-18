// 调试：定位 A1 场景中 AI 卡死的具体异常
const errs=[];
window.addEventListener('error', e=>{ errs.push('GLOBAL: '+(e.error&&e.error.stack||e.message)); });
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
document.getElementById('lobby').classList.add('hide');
newGame(); GAME_MODE='ai';
G.board = Array.from({length:20},()=>Array(20).fill(null));
G.pieces.forEach(p=>{ p.hp=10; p.shields=[0,0,0]; p.alive=true; p.moved=false; p.bonusMoves=0; p.buffLinjia=false; });
const red = G.pieces.filter(p=>p.side===2), blue = G.pieces.filter(p=>p.side===1);
blue[0].x=11; blue[0].y=10; blue[1].x=11; blue[1].y=12; blue[2].x=11; blue[2].y=14;
red[0].x=10; red[0].y=10; red[1].x=10; red[1].y=12; red[2].x=10; red[2].y=14;
G.hands[2]=['huikan']; G.hands[1]=['shanbi'];
G.stamina={1:8,2:8}; G.lastConsumed={1:0,2:0}; G.turn=2; G.phase='select';
G.selected=null; G.moveHighlights=null; G.targetCtx=null; G.targetHighlights=null; G.pending=null; G.over=null;
try { aiTurn(); } catch(err){ errs.push('aiTurn THROW: '+err.stack); }
for(let i=0;i<30;i++){
  await sleep(200);
  if(document.getElementById('dYes')) break;
  if(G.turn===1 && !aiBusy) break;
}
const dbg = {
  errs, modal: !!document.getElementById('dYes'), turn:G.turn, aiBusy, aiAtkBusy,
  phase:G.phase, pending:!!G.pending, targetCtx:!!G.targetCtx,
  sel:G.selected, moveHL:!!G.moveHighlights, redPos:red.map(p=>[p.x,p.y]), blue0:[blue[0].x,blue[0].y],
  hands: JSON.stringify(G.hands), stamina: JSON.stringify(G.stamina), lastConsumed: JSON.stringify(G.lastConsumed)
};
return { total:1, passed: dbg.errs.length===0 && (dbg.modal || dbg.turn===1), failed: 1, results:[{name:'debug', pass:false, extra:dbg}] };
