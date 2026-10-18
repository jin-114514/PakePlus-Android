# -*- coding: utf-8 -*-
from PIL import Image
src = r'C:\Users\18353\DoubaoWork\chats\2026-10-17\new-chat\棋盘战棋卡牌Demo\_shots\棋盘战棋卡牌Demo_desktop.jpg'
out = r'C:\Users\18353\DoubaoWork\chats\2026-10-17\new-chat\棋盘战棋卡牌Demo\_shots\zoom_board.jpg'
im = Image.open(src)
print('size', im.size)
w, h = im.size
im2 = im.crop((0, 0, int(w*0.72), int(h*0.5))).resize((int(w*0.72*2), int(h*0.5*2)), Image.NEAREST)
im2.save(out)
print('saved', out)
