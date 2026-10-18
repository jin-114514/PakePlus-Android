// 预览：人机胜利结算界面
document.getElementById('lobby').classList.add('hide');
newGame(); GAME_MODE='ai';
G.pieces.filter(p=>p.side===2).forEach(p=>{p.alive=false; p.hp=0;});
checkWin();
