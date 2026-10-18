// 调试2：探针记录 onTargetCell / beginCardPlay 每一步
const errs=[];
window.addEventListener('error', e=>{ errs.push('GLOBAL: '+(e.error&&e.error.stack||e.message)); });
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
window.__ot = []; window.__bc = [];
const origOT = onTargetCell, origBC = beginCardPlay;
onTargetCell = function(x,y){
  const tc = G.targetCtx;
  const p = pieceAt(x,y);
  window.__ot.push({x, y, step: tc&&tc.step, cid: tc&&tc.card&&tc.card.id, p: p&&p.id, pxy: p&&[p.x,p.y], hl: (G.targetHighlights||[]).length, phase: G.phase, sel: G.selected});
  const r = origOT.apply(this, arguments);
  const tc2 = G.targetCtx;
  window.__ot[window.__ot.length-1].after = {phase:G.phase, step: tc2&&tc2.step, pending:!!G.pending, tgt:!!G.targetCtx, hl:(G.targetHighlights||[]).length};
  return r;
};
beginCardPlay = function(cid){
  window.__bc.push({cid, phase:G.phase, sel:G.selected, moveHL:!!G.moveHighlights, turn:G.turn});
  return origBC.apply(this, arguments);
};
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
for(let i=0;i<30;i++){ await sleep(200); if(document.getElementById('dYes')) break; if(G.turn===1 && !aiBusy) break; }
return { total:1, passed:false, failed:1, results:[{name:'dbg2', pass:false, extra:{errs, ot:window.__ot, bc:window.__bc, turn:G.turn, aiBusy, aiAtkBusy, phase:G.phase, modal:!!document.getElementById('dYes'), redPos:red.map(p=>[p.x,p.y])}}] };
