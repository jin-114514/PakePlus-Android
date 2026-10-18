// 复现：人机 AI 回合是否会自动结束（多局压力测试）—— 顶层 async，由 shot.py 包成 async ()=>{}
const results=[];
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
let stuckCount=0;
const details=[];
for(let i=0;i<10;i++){
  newGame();
  GAME_MODE='ai';
  document.getElementById('lobby').classList.add('hide');
  endTurn(); // 蓝方直接结束 → 触发 aiTurn
  const t0=Date.now();
  let ok=false;
  while(Date.now()-t0<8000){
    await sleep(300);
    if(G.turn===1 && !aiBusy){ ok=true; break; }
    if(G.over){ ok=true; break; }
  }
  if(!ok){
    stuckCount++;
    details.push({i, phase:G.phase, sel:G.selected, aiBusy, pending:!!G.pending, target:!!G.targetCtx,
      moveHL:!!G.moveHighlights, modal:!!document.getElementById('dYes'), turn:G.turn});
    if(document.getElementById('dNo')){ document.getElementById('dNo').onclick(); await sleep(500); }
  }
}
results.push({name:'AI10局全部自动结束回合', pass: stuckCount===0, extra:{stuckCount, details}});
return { total: results.length, passed: results.filter(r=>r.pass).length, failed: results.filter(r=>!r.pass).length, results };
