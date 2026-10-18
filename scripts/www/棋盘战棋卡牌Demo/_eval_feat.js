// 新功能验证：双击出牌 / 强制弃牌自行选择 / 胜负界面 / 背景音乐
const results = [];
function rec(name, cond, extra){ results.push({name, pass: !!cond, extra: extra || null}); }
function find(side, idx){ return G.pieces.find(p=>p.side===side && p.id===`p${side}_${idx}`); }

// F1 双击直接出牌（疾步进入目标选择）
newGame();
G.hands[1]=['jibu','jibu','jibu','jibu','jibu'];
onCardDouble(0);
rec('F1 双击出牌进入目标选择', G.phase==='target' && !!G.targetCtx && G.hands[1].length===5, {phase:G.phase, h:G.hands[1].length});
const jp1 = find(1,0);
onTargetCell(jp1.x, jp1.y);
rec('F1b 选目标后扣体力转移并去牌', G.stamina[1]===7 && G.stamina[2]===9 && G.hands[1].length===4, {st:[G.stamina[1],G.stamina[2]], h:G.hands[1].length});

// F2 双击被动卡被拒
newGame();
G.hands[1]=['shanbi','jibu','jibu','jibu','jibu'];
onCardDouble(0);
rec('F2 双击被动卡不可打出', G.phase==='select' && G.hands[1].length===5, {phase:G.phase});

// F3 双击体力不足被拒
newGame();
G.stamina[1]=0; G.stamina[2]=16;
G.hands[1]=['jibu','jibu','jibu','jibu','jibu'];
onCardDouble(0);
rec('F3 双击体力不足被拒', G.phase==='select' && G.hands[1].length===5 && G.stamina[1]===0, {phase:G.phase});

// F4 真实双击事件绑定（模拟浏览器 dblclick）
newGame();
G.hands[1]=['jibu','jibu','jibu','jibu','jibu'];
const cd = document.querySelector('#hand .card');
cd.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));
rec('F4 双击事件绑定生效', G.phase==='target' && !!G.targetCtx && G.hands[1].length===5, {phase:G.phase});

// F5 人机模式蓝方回合超限 → 弹窗自行选择
newGame(); GAME_MODE='ai';
G.hands[1]=Array(6).fill('jibu'); G.hands[2]=[];
G.turn=2; G.phase='select';
endTurn();
rec('F5 蓝方超限回合开始弹出弃牌选择', !!discardState && G.turn===1 && document.getElementById('discardMask').classList.contains('show'), {state:!!discardState, h1:G.hands[1].length});
discardPick(0);
rec('F5b 弃完自动继续', discardState===null && G.hands[1].length===5 && G.lastConsumed[1]===1, {h1:G.hands[1].length});

// F6 AI回合超限 → 自动弃牌不弹窗
newGame(); GAME_MODE='ai';
G.hands[2]=Array(6).fill('jibu'); G.hands[1]=[];
G.turn=1; G.phase='select';
endTurn();
rec('F6 AI回合超限自动弃到5', discardState===null && G.turn===2 && G.hands[2].length===5, {h2:G.hands[2].length, state:!!discardState});

// F7 胜负界面：人机胜利 + 再来一局
newGame(); GAME_MODE='ai';
G.pieces.filter(p=>p.side===2).forEach(p=>{p.alive=false; p.hp=0;});
checkWin();
rec('F7 人机胜利界面显示', G.over===1 && document.getElementById('overMask').classList.contains('show') && document.getElementById('overTitle').textContent==='胜 利', {t:document.getElementById('overTitle').textContent});
document.getElementById('btnOverAgain').onclick();
rec('F7b 再来一局重置对局', !document.getElementById('overMask').classList.contains('show') && G.over===null && G.turn===1 && G.pieces.every(p=>p.alive), {over:G.over});

// F8 胜负界面：人机失败 + 退出回大厅
newGame(); GAME_MODE='ai';
G.pieces.filter(p=>p.side===1).forEach(p=>{p.alive=false; p.hp=0;});
checkWin();
rec('F8 人机失败界面显示', G.over===2 && document.getElementById('overTitle').textContent==='失 败', {t:document.getElementById('overTitle').textContent});
document.getElementById('btnOverExit').onclick();
rec('F8b 退出返回大厅', !document.getElementById('overMask').classList.contains('show') && !document.getElementById('lobby').classList.contains('hide'), {});

// F9 双人模式胜负文案
newGame(); GAME_MODE='pvp';
G.pieces.filter(p=>p.side===2).forEach(p=>{p.alive=false; p.hp=0;});
checkWin();
rec('F9 双人模式蓝方胜利文案', document.getElementById('overTitle').textContent==='蓝方胜利', {t:document.getElementById('overTitle').textContent});
newGame();

// F10 背景音乐元素与开关
rec('F10 音乐元素存在且指向本地', !!document.getElementById('bgm') && document.querySelector('#bgm source').getAttribute('src')==='assets/bgm.wav', {});
const mBtn = document.getElementById('btnMusic');
rec('F10b 音乐按钮可切换', !!mBtn && (mBtn.textContent==='音乐' || mBtn.textContent==='静音'), {txt:mBtn.textContent});

return { total: results.length, passed: results.filter(r=>r.pass).length, failed: results.filter(r=>!r.pass).length, results };
