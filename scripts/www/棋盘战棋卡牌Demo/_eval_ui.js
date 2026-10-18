// UI 绑定验证（async）：大厅 → 模式切换 → 开始游戏 → 对局核心路径 → 返回大厅 → 人机 AI 回合
const results=[];
function rec(n,c,e){results.push({name:n,pass:!!c,extra:e||null});}
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const cv = document.getElementById('board');
function clickCell(x,y){
  const rect = cv.getBoundingClientRect();
  const cx = rect.left + (x*CELL + CELL/2)/800*rect.width;
  const cy = rect.top + (y*CELL + CELL/2)/800*rect.height;
  cv.dispatchEvent(new MouseEvent('click',{clientX:cx, clientY:cy, bubbles:true}));
}
const lobby = document.getElementById('lobby');

// L1 初始显示大厅
rec('L1 初始显示大厅', !!lobby && !lobby.classList.contains('hide'), {});
// L2 模式切换：人机
document.getElementById('modeAi').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('L2 切到人机模式', GAME_MODE==='ai' && document.getElementById('modeAi').classList.contains('sel')
  && document.getElementById('modeChip').textContent.indexOf('人机')>=0, {mode:GAME_MODE});
// L3 切回匹配
document.getElementById('modePvp').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('L3 切回匹配模式', GAME_MODE==='pvp' && document.getElementById('modePvp').classList.contains('sel'), {mode:GAME_MODE});
// L4 开始游戏
document.getElementById('btnStart').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('L4 开始游戏进入对局', lobby.classList.contains('hide') && G.turn===1 && G.over===null && G.hands[1].length===5, {});

// 对局核心路径
const p0 = G.pieces.find(p=>p.side===1);
clickCell(p0.x, p0.y);
rec('U1 画布点击选中进入移动态', G.phase==='move' && G.selected===p0.id, {phase:G.phase, sel:G.selected});
const hl = (G.moveHighlights||[]).slice();
let moved=false;
if(hl.length){ clickCell(hl[0][0], hl[0][1]); moved = p0.moved===true && G.phase==='select'; }
rec('U2 画布点击移动生效', !!hl.length && moved, {pos:[p0.x,p0.y], moved:p0.moved, phase:G.phase});
const card0 = document.querySelector('.hand-zone .card');
if(card0){ card0.dispatchEvent(new MouseEvent('click',{bubbles:true})); }
await sleep(320); // 单击延迟 240ms 打开详情（防双击误触）
rec('U3 手牌点击弹出详情', !!document.getElementById('mPlay'), {});
const mClose = document.getElementById('mClose');
if(mClose) mClose.onclick();
document.getElementById('btnEndTurn').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('U4 结束回合按钮生效', G.turn===2 && G.phase==='select' && G.hands[2].length>=5, {turn:G.turn, h2:G.hands[2].length});
document.getElementById('btnRules').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('U5 规则弹窗', !!document.getElementById('mClose2'));
const mc2 = document.getElementById('mClose2');
if(mc2) mc2.onclick();

// L5 返回大厅（confirm 打桩）
window.confirm = ()=>true;
document.getElementById('btnLobby').dispatchEvent(new MouseEvent('click',{bubbles:true}));
rec('L5 返回大厅', !lobby.classList.contains('hide'), {});
// L6 人机模式重新开始 → 蓝方移动并结束回合 → AI 自动行动（真实计时等待）
document.getElementById('modeAi').dispatchEvent(new MouseEvent('click',{bubbles:true}));
document.getElementById('btnStart').dispatchEvent(new MouseEvent('click',{bubbles:true}));
const pA = G.pieces.find(p=>p.side===1);
clickCell(pA.x, pA.y);
if(G.moveHighlights && G.moveHighlights.length) clickCell(G.moveHighlights[0][0], G.moveHighlights[0][1]);
const logLen = G.log.length;
document.getElementById('btnEndTurn').dispatchEvent(new MouseEvent('click',{bubbles:true}));
await sleep(6500);
if(document.getElementById('dNo')){ document.getElementById('dNo').onclick(); await sleep(2500); }
rec('L6 人机AI回合自动完成并回到蓝方', G.turn===1 && !aiBusy && G.over===null, {turn:G.turn, aiBusy});
rec('L7 AI回合有行动记录', G.log.length>logLen, {growth:G.log.length-logLen});

return { total: results.length, passed: results.filter(r=>r.pass).length, failed: results.filter(r=>!r.pass).length, results };
