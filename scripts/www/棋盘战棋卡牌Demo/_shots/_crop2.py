# -*- coding: utf-8 -*-
from PIL import Image
src = r'C:\Users\18353\DoubaoWork\chats\2026-10-17\new-chat\棋盘战棋卡牌Demo\_shots\棋盘战棋卡牌Demo_desktop.jpg'
out = r'C:\Users\18353\DoubaoWork\chats\2026-10-17\new-chat\棋盘战棋卡牌Demo\_shots\zoom_piece.jpg'
im = Image.open(src)
box = (120, 30, 460, 190)
im2 = im.crop(box).resize(((box[2]-box[0])*4, (box[3]-box[1])*4), Image.NEAREST)
im2.save(out)
print('saved', im2.size)
