// 调试3：记录 resolveAtkDone / endTurn / 弹窗按钮调用序列
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const calls=[];
const _rad = resolveAtkDone;
resolveAtkDone = function(){ calls.push({t:'rad', atkCb:!!aiAtkCb, atkBusy:aiAtkBusy, cb:typeof aiAtkCb==='function'? 'fn':'null'}); return _rad(); };
const _et = endTurn;
endTurn = function(){ calls.push({t:'endTurn', phase:G.phase, aiBusy, turn:G.turn}); return _et(); };
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
aiTurn();
let modal=false, t=Date.now();
while(Date.now()-t<3500){ await sleep(150); if(document.getElementById('dYes')){ modal=true; break; } }
calls.push({t:'modalFound', modal});
if(modal){
  const dNo = document.getElementById('dNo');
  calls.push({t:'clickDNo', dNo:!!dNo});
  if(dNo) dNo.onclick();
  await sleep(500);
}
t=Date.now();
while(Date.now()-t<6000){ await sleep(300); if((G.turn===1 && !aiBusy) || G.over) break; }
return { total:1, passed:false, failed:1, results:[{name:'dbg3', pass:false, extra:{calls, turn:G.turn, aiBusy, aiAtkBusy, phase:G.phase, modal:!!document.getElementById('dYes'), log:G.log.slice(-8)}}] };
