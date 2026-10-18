// 玩法核心路径浏览器验证（eval-file，由 shot.py 注入页面执行）
const results = [];
function rec(name, cond, extra){ results.push({name, pass: !!cond, extra: extra || null}); }
function reset(){ newGame(); }
function clearBoard(){ G.board = Array.from({length:20}, ()=>Array(20).fill(null)); }
function find(side, idx){ return G.pieces.find(p=>p.side===side && p.id===`p${side}_${idx}`); }

// T1 初始状态
reset();
rec('T1 初始状态', G.turn===1 && G.phase==='select' && G.pieces.length===6
  && G.hands[1].length===5 && G.hands[2].length===5 && G.stamina[1]===8 && G.stamina[2]===8,
  {pieces: G.pieces.map(p=>({id:p.id,x:p.x,y:p.y,hp:p.hp}))});

// T2 移动（8方向）
reset();
const bp2 = find(1,0);
onSelectCell(bp2.x, bp2.y);
const hl2 = G.moveHighlights || [];
let mv = null;
for(let dy=-1;dy<=1 && !mv;dy++) for(let dx=-1;dx<=1;dx++){
  const nx=bp2.x+dx, ny=bp2.y+dy;
  if((dx||dy) && hl2.some(([hx,hy])=>hx===nx&&hy===ny)){ onMoveCell(nx,ny); mv=[nx,ny]; }
}
rec('T2 选兵进入移动态', hl2.length>=1, {highlights: hl2});
rec('T2 移动生效', !!mv && bp2.x===mv[0] && bp2.y===mv[1] && bp2.moved===true, {to: mv});
rec('T2 移后回select', G.phase==='select');
// 再次点击已移动的兵 → 不得再次进入移动态
const bp2b2 = find(1,0);
onSelectCell(bp2b2.x, bp2b2.y);
rec('T2 已移动不可再动', G.phase==='select' && G.selected===null && G.moveHighlights===null, {phase:G.phase});

// T3 疾步：再移动2格
reset();
G.hands[1]=['jibu','jibu','jibu','jibu','jibu'];
const jp = find(1,0);
G.pending={handIdx:0, cardId:'jibu'};
beginCardPlay('jibu');
rec('T3 疾步进入选目标', G.phase==='target' && !!G.targetCtx);
onTargetCell(jp.x, jp.y);
rec('T3 疾步体力-1转移', G.stamina[1]===7 && G.stamina[2]===9 && G.hands[1].length===4, {st:[G.stamina[1],G.stamina[2]]});
rec('T3 疾步+2格', jp.bonusMoves===2, {bonus:jp.bonusMoves});
// 疾步后可连走2步
const jpx0=jp.x, jpy0=jp.y;
onSelectCell(jp.x,jp.y);
let step1=null;
const hl3 = G.moveHighlights||[];
for(let dy=-1;dy<=1&&!step1;dy++)for(let dx=-1;dx<=1;dx++){ const nx=jp.x+dx,ny=jp.y+dy; if((dx||dy)&&hl3.some(([hx,hy])=>hx===nx&&hy===ny)){ onMoveCell(nx,ny); step1=[nx,ny]; } }
let step2=null;
onSelectCell(jp.x,jp.y);
const hl3b = G.moveHighlights||[];
for(let dy=-1;dy<=1&&!step2;dy++)for(let dx=-1;dx<=1;dx++){ const nx=jp.x+dx,ny=jp.y+dy; if((dx||dy)&&hl3b.some(([hx,hy])=>hx===nx&&hy===ny)){ onMoveCell(nx,ny); step2=[nx,ny]; } }
// 疾步在普通移动前施放：共可走 3 次（普通1 + 疾步2）
let step3=null;
onSelectCell(jp.x,jp.y);
const hl3c = G.moveHighlights||[];
for(let dy=-1;dy<=1&&!step3;dy++)for(let dx=-1;dx<=1;dx++){ const nx=jp.x+dx,ny=jp.y+dy; if((dx||dy)&&hl3c.some(([hx,hy])=>hx===nx&&hy===ny)){ onMoveCell(nx,ny); step3=[nx,ny]; } }
rec('T3 疾步后可走3次', !!step1 && !!step2 && !!step3 && jp.bonusMoves===0 && jp.moved===true, {step1, step2, step3, from:[jpx0,jpy0]});
// 3 次走完不可再动（已移动且无额外次数）
onSelectCell(jp.x, jp.y);
rec('T3 走完3次不可再动', G.phase==='select' && G.selected===null, {phase:G.phase});

// T4 恢复
reset();
G.hands[1]=['huifu','huifu','huifu','huifu','huifu'];
const rp = find(1,0); rp.hp=8;
G.pending={handIdx:0, cardId:'huifu'};
beginCardPlay('huifu');
onTargetCell(rp.x, rp.y);
rec('T4 恢复+1', rp.hp===9, {hp:rp.hp});
rp.hp=10;
rec('T4 满血不可用', canPlayCard('huifu',1)===false);

// T5 治疗（全体）
reset();
G.hands[1]=['zhiliao','zhiliao','zhiliao','zhiliao','zhiliao'];
const tp = G.pieces.filter(p=>p.side===1);
tp[0].hp=9; tp[1].hp=8;
G.pending={handIdx:0, cardId:'zhiliao'};
beginCardPlay('zhiliao');
rec('T5 治疗全体+1', tp[0].hp===10 && tp[1].hp===9 && tp[2].hp===10 && G.stamina[1]===6 && G.stamina[2]===10, {hp:tp.map(p=>p.hp)});
tp.forEach(p=>p.hp=10);
rec('T5 全满不可用', canPlayCard('zhiliao',1)===false);

// T6 护甲
reset();
G.hands[1]=['hujia','hujia','hujia','hujia','hujia'];
const ap = find(1,0);
G.pending={handIdx:0, cardId:'hujia'};
beginCardPlay('hujia');
onTargetCell(ap.x, ap.y);
rec('T6 护甲+1槽', ap.shields.filter(s=>s===2).length===1, {shields:ap.shields});
G.pieces.filter(p=>p.side===1).forEach(p=>{ p.shields=[2,2,2]; });
rec('T6 满3槽不可用', canPlayCard('hujia',1)===false);

// T7 护盾三态结算
reset();
const dp = find(2,0);
dp.shields=[2,2,2]; dp.hp=10;
damagePiece(dp,1,{kind:'damage'});
const s1=dp.shields.slice(), h1=dp.hp;
damagePiece(dp,1,{kind:'damage'});
const s2=dp.shields.slice(), h2=dp.hp;
damagePiece(dp,2,{kind:'damage'});
const s3=dp.shields.slice(), h3=dp.hp;
dp.shields=[0,0,0];
damagePiece(dp,5,{kind:'damage'});
rec('T7 全甲受1→碎甲', s1[0]===1 && h1===10, {s1,h1});
rec('T7 碎甲受1被吸收', s2[0]===0 && h2===10, {s2,h2});
rec('T7 全甲受2被吸收', s3[0]===0 && s3[1]===0 && h3===10, {s3,h3});
rec('T7 无盾受5扣血', dp.hp===5, {hp:dp.hp});

// T8 麟甲免疫
reset();
const lp = find(2,0); lp.buffLinjia=true; lp.hp=7;
damagePiece(lp,2,{kind:'damage'});
rec('T8 麟甲免疫伤害', lp.hp===7 && lp.alive, {hp:lp.hp});

// T9 挥砍（相邻敌）
reset(); clearBoard(); G.hands[2]=[];
const bp9 = find(1,0), rp9 = find(2,0);
bp9.x=10;bp9.y=10; rp9.x=10;rp9.y=11;
G.hands[1]=['huikan','huikan','huikan','huikan','huikan'];
G.pending={handIdx:0, cardId:'huikan'};
beginCardPlay('huikan');
rec('T9 挥砍step1', G.targetCtx && G.targetCtx.step===1);
onTargetCell(10,10);
rec('T9 挥砍step2', G.targetCtx && G.targetCtx.step===2);
onTargetCell(10,11);
rec('T9 挥砍打1', rp9.hp===9, {hp:rp9.hp});
// 挥砍可拆障碍
reset(); clearBoard(); G.hands[2]=[];
const bp9b = find(1,0);
bp9b.x=10;bp9b.y=10; G.board[11][10]={type:'debris'};
G.hands[1]=['huikan','huikan','huikan','huikan','huikan'];
G.pending={handIdx:0, cardId:'huikan'};
beginCardPlay('huikan'); onTargetCell(10,10); onTargetCell(10,11);
rec('T9 挥砍拆障碍', G.board[10][11]===null);

// T10 横扫 T形3格（前1+左右各1；身后不伤）
reset(); clearBoard(); G.hands[2]=[];
const bp10 = find(1,0);
const r10a = find(2,0), r10b = find(2,1), r10c = find(2,2);
bp10.x=10;bp10.y=10; r10a.x=10;r10a.y=9; r10b.x=11;r10b.y=10; r10c.x=10;r10c.y=11;
G.hands[1]=['hengsao','hengsao','hengsao','hengsao','hengsao'];
G.pending={handIdx:0, cardId:'hengsao'};
beginCardPlay('hengsao'); onTargetCell(10,10); onTargetCell(10,9); // 选“上”
rec('T10 横扫T形2敌各-1', r10a.hp===9 && r10b.hp===9, {hp:[r10a.hp,r10b.hp]});
rec('T10 横扫不伤身后', r10c.hp===10, {hp:r10c.hp});

// T11 击退
reset(); clearBoard(); G.hands[2]=[];
const bp11 = find(1,0), rp11 = find(2,0);
bp11.x=10;bp11.y=10; rp11.x=10;rp11.y=11;
G.hands[1]=['jitui','jitui','jitui','jitui','jitui'];
G.pending={handIdx:0, cardId:'jitui'};
beginCardPlay('jitui'); onTargetCell(10,10); onTargetCell(10,11);
rec('T11 击退1伤+退1', rp11.hp===9 && rp11.x===10 && rp11.y===12, {pos:[rp11.x,rp11.y],hp:rp11.hp});

// T12 击退遇墙不退
reset(); clearBoard(); G.hands[2]=[];
const bp12 = find(1,0), rp12 = find(2,0);
bp12.x=10;bp12.y=10; rp12.x=10;rp12.y=11; G.board[12][10]={type:'wall'};
G.hands[1]=['jitui','jitui','jitui','jitui','jitui'];
G.pending={handIdx:0, cardId:'jitui'};
beginCardPlay('jitui'); onTargetCell(10,10); onTargetCell(10,11);
rec('T12 击退有墙不退', rp12.hp===9 && rp12.y===11, {pos:[rp12.x,rp12.y],hp:rp12.hp});

// T13 穿刺：打1 + 贯穿击退敌人 + 自身进3
reset(); clearBoard(); G.hands[2]=[];
const bp13 = find(1,0), rp13 = find(2,0);
bp13.x=10;bp13.y=10; rp13.x=10;rp13.y=11;
G.hands[1]=['chuanc','chuanc','chuanc','chuanc','chuanc'];
G.pending={handIdx:0, cardId:'chuanc'};
beginCardPlay('chuanc'); onTargetCell(10,10); onTargetCell(10,11);
rec('T13 穿刺打1', rp13.hp===9, {hp:rp13.hp});
rec('T13 贯穿击退敌人+自身进3', rp13.x===10 && rp13.y===14 && bp13.x===10 && bp13.y===13, {enemy:[rp13.x,rp13.y],self:[bp13.x,bp13.y]});

// T14 穿刺被墙挡取消前进
reset(); clearBoard(); G.hands[2]=[];
const bp14 = find(1,0), rp14 = find(2,0);
bp14.x=10;bp14.y=10; rp14.x=10;rp14.y=11; G.board[12][10]={type:'wall'};
G.hands[1]=['chuanc','chuanc','chuanc','chuanc','chuanc'];
G.pending={handIdx:0, cardId:'chuanc'};
beginCardPlay('chuanc'); onTargetCell(10,10); onTargetCell(10,11);
rec('T14 穿刺遇墙取消前进', rp14.hp===9 && bp14.x===10 && bp14.y===10, {self:[bp14.x,bp14.y],hp:rp14.hp});

// T15 闪避被动（使用分支）
reset(); clearBoard();
const bp15 = find(1,0), rp15 = find(2,0);
bp15.x=10;bp15.y=10; rp15.x=10;rp15.y=11;
G.turn=2; G.phase='select';
G.hands[1]=['shanbi']; G.hands[2]=['huikan'];
G.pending={handIdx:0, cardId:'huikan'};
beginCardPlay('huikan'); onTargetCell(10,11); onTargetCell(10,10);
rec('T15 闪避弹窗出现', !!document.getElementById('dYes'));
const st15=[G.stamina[1],G.stamina[2]];
document.getElementById('dYes').onclick();
rec('T15 进入选位', G.phase==='dodge' && G.dodgeCells.length>0, {cells:G.dodgeCells});
const cell = G.dodgeCells.find(c=>c[0]!==bp15.x||c[1]!==bp15.y) || G.dodgeCells[0];
resolveDodge(cell[0], cell[1]);
rec('T15 闪避躲开不受伤', bp15.hp===10 && bp15.x===cell[0] && bp15.y===cell[1], {pos:[bp15.x,bp15.y],hp:bp15.hp});
rec('T15 闪避扣体力转移+弃卡', G.hands[1].length===0 && G.stamina[1]===st15[0]-1 && G.stamina[2]===st15[1]+1, {st:[G.stamina[1],G.stamina[2]]});

// T16 闪避被动（承受分支）
reset(); clearBoard();
const bp16 = find(1,0), rp16 = find(2,0);
bp16.x=10;bp16.y=10; rp16.x=10;rp16.y=11;
G.turn=2; G.phase='select';
G.hands[1]=['shanbi']; G.hands[2]=['huikan'];
G.pending={handIdx:0, cardId:'huikan'};
beginCardPlay('huikan'); onTargetCell(10,11); onTargetCell(10,10);
document.getElementById('dNo').onclick();
rec('T16 承受攻击受伤', bp16.hp===9 && G.hands[1].length===1, {hp:bp16.hp});

// T17 兜底补牌（合计<7，不足补到5）
reset();
G.hands[1]=['jibu','jibu','jibu']; G.hands[2]=['jibu','jibu','jibu'];
endTurn();
rec('T17 合计6张补到5', G.hands[1].length===5 && G.hands[2].length===5, {h:[G.hands[1].length,G.hands[2].length]});

// T18 强制弃牌（合计<7 超限 → 当前回合方弹窗自行选择弃牌）
reset();
G.hands[1]=Array(6).fill('jibu'); G.hands[2]=[];
G.turn=2; G.phase='select'; // 红方回合结束 → 进入蓝方回合
endTurn();
rec('T18 超限回合开始弹出弃牌选择', !!discardState && discardState.remaining===1
  && G.turn===1 && document.getElementById('discardMask').classList.contains('show'),
  {state: !!discardState, turn: G.turn, h1: G.hands[1].length});
discardPick(0);
rec('T18 点选弃牌后手牌5张并继续', G.hands[1].length===5 && discardState===null
  && !document.getElementById('discardMask').classList.contains('show') && G.lastConsumed[1]===1,
  {h:[G.hands[1].length,G.hands[2].length], lc:G.lastConsumed[1]});

// T19 补牌=对手消耗且清零
reset();
G.lastConsumed[1]=3; G.hands[2]=['jibu'];
endTurn();
rec('T19 红方补3张+消耗清零', G.hands[2].length===4 && G.lastConsumed[1]===0, {h2:G.hands[2].length, lc:G.lastConsumed[1]});

// T20 胜负判定 + 重开
reset();
G.pieces.filter(p=>p.side===2).forEach(p=>{p.alive=false; p.hp=0;});
checkWin();
rec('T20 蓝方胜利判定', G.over===1, {over:G.over});
newGame();
rec('T20 重开状态干净', G.turn===1 && G.over===null && G.pieces.every(p=>p.alive) && G.hands[1].length===5 && G.hands[2].length===5);

return { total: results.length, passed: results.filter(r=>r.pass).length, failed: results.filter(r=>!r.pass).length, results };
