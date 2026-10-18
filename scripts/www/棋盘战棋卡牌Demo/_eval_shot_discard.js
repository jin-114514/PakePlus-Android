// 预览：弃牌选择弹窗（双方合计<7 触发，蓝方6张超限）
document.getElementById('lobby').classList.add('hide');
newGame();
G.hands[1]=Array(6).fill('jibu'); G.hands[2]=[];
G.turn=2; G.phase='select';
endTurn();
