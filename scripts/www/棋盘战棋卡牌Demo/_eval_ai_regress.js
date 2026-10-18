// AI 回归专项：闪避弹窗后能否继续并结束回合、无路可走/边缘横扫是否卡回合
const results=[];
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
function hideLobby(){ document.getElementById('lobby').classList.add('hide'); }
function setupBoard(){
  G.board = Array.from({length:20},()=>Array(20).fill(null));
  G.pieces.forEach(p=>{ p.hp=10; p.shields=[0,0,0]; p.alive=true; p.moved=false; p.bonusMoves=0; p.buffLinjia=false; });
  G.stamina={1:8,2:8}; G.lastConsumed={1:0,2:0}; G.turn=2; G.phase='select';
  G.selected=null; G.moveHighlights=null; G.targetCtx=null; G.targetHighlights=null; G.pending=null;
  G.over=null;
}

// A1: 单目标攻击触发闪避 → 玩家选“承受” → AI 自动完成回合
{
  newGame(); GAME_MODE='ai'; hideLobby(); setupBoard();
  const red = G.pieces.filter(p=>p.side===2), blue = G.pieces.filter(p=>p.side===1);
  blue[0].x=11; blue[0].y=10; blue[1].x=11; blue[1].y=12; blue[2].x=11; blue[2].y=14;
  red[0].x=10; red[0].y=10; red[1].x=10; red[1].y=12; red[2].x=10; red[2].y=14;
  G.hands[2]=['huikan']; G.hands[1]=['shanbi'];
  aiTurn();
  let d1=false, t1=Date.now();
  while(Date.now()-t1<3500){ await sleep(150); if(document.getElementById('dYes')){ d1=true; break; } }
  if(d1) document.getElementById('dNo').onclick();
  t1=Date.now();
  while(Date.now()-t1<6000){ await sleep(300); if((G.turn===1 && !aiBusy) || G.over) break; }
  results.push({name:'A1 闪避弹窗-承受后AI自动结束回合', pass: d1 && G.turn===1 && !aiBusy && G.over===null, extra:{modal:d1, turn:G.turn, aiBusy}});
}

// A2: 闪避后选“使用闪避”并点击落点 → AI 自动完成回合
{
  newGame(); GAME_MODE='ai'; hideLobby(); setupBoard();
  const red = G.pieces.filter(p=>p.side===2), blue = G.pieces.filter(p=>p.side===1);
  blue[0].x=11; blue[0].y=10; blue[1].x=11; blue[1].y=12; blue[2].x=11; blue[2].y=14;
  red[0].x=10; red[0].y=10; red[1].x=10; red[1].y=12; red[2].x=10; red[2].y=14;
  G.hands[2]=['jitui']; G.hands[1]=['shanbi'];
  aiTurn();
  let d2=false, t2=Date.now();
  while(Date.now()-t2<3500){ await sleep(150); if(document.getElementById('dYes')){ d2=true; break; } }
  if(d2){
    document.getElementById('dYes').onclick();
    const cells = G.dodgeCells||[];
    if(cells.length) resolveDodge(cells[0][0], cells[0][1]);
  }
  t2=Date.now();
  while(Date.now()-t2<6000){ await sleep(300); if((G.turn===1 && !aiBusy) || G.over) break; }
  results.push({name:'A2 闪避弹窗-闪避落点后AI自动结束回合', pass: d2 && G.turn===1 && !aiBusy && G.over===null, extra:{modal:d2, turn:G.turn, aiBusy}});
}

// A3: 红方全部被障碍包围无路可走 → AI 仍自动结束回合
{
  newGame(); GAME_MODE='ai'; hideLobby(); setupBoard();
  const red = G.pieces.filter(p=>p.side===2);
  // 全部围死：周围8格放墙
  const box = [[9,9],[10,9],[11,9],[9,10],[11,10],[9,11],[10,11],[11,11]];
  box.forEach(([x,y])=>{ G.board[y][x]={type:'wall'}; });
  red.forEach(p=>{ p.x=10; p.y=10; });
  G.pieces.filter(p=>p.side===1).forEach(p=>{ p.x=15; p.y=15; });
  G.hands[2]=[]; G.hands[1]=[];
  aiTurn();
  await sleep(5000);
  results.push({name:'A3 无路可走不卡回合', pass: G.turn===1 && !aiBusy && G.over===null, extra:{turn:G.turn, aiBusy, phase:G.phase}});
}

// A4: 横扫在棋盘角落（方向越界）→ 不卡回合
{
  newGame(); GAME_MODE='ai'; hideLobby(); setupBoard();
  const red = G.pieces.filter(p=>p.side===2), blue = G.pieces.filter(p=>p.side===1);
  red[0].x=0; red[0].y=0; red[1].x=2; red[1].y=0; red[2].x=0; red[2].y=2;
  blue[0].x=1; blue[0].y=1; blue[1].x=3; blue[1].y=3; blue[2].x=5; blue[2].y=5;
  G.hands[2]=['hengsao']; G.hands[1]=[];
  aiTurn();
  await sleep(5000);
  results.push({name:'A4 横扫边缘方向不卡回合', pass: G.turn===1 && !aiBusy && G.over===null, extra:{turn:G.turn, aiBusy, phase:G.phase}});
}

// A5: 随机20局全部自动结束回合
{
  let stuck=0;
  for(let i=0;i<20;i++){
    newGame(); GAME_MODE='ai'; hideLobby();
    endTurn();
    const t0=Date.now(); let ok=false;
    while(Date.now()-t0<9000){
      await sleep(300);
      if((G.turn===1 && !aiBusy) || G.over){ ok=true; break; }
    }
    if(!ok){
      stuck++;
      if(document.getElementById('dNo')){ document.getElementById('dNo').onclick(); await sleep(500); }
    }
  }
  results.push({name:'A5 随机20局AI全部自动结束', pass: stuck===0, extra:{stuck}});
}

return { total: results.length, passed: results.filter(r=>r.pass).length, failed: results.filter(r=>!r.pass).length, results };
