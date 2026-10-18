# -*- coding: utf-8 -*-
from PIL import Image
src = r'C:\Users\18353\DoubaoWork\chats\2026-10-17\new-chat\棋盘战棋卡牌Demo\_shots\棋盘战棋卡牌Demo_desktop.jpg'
im = Image.open(src).convert('RGB')
W, H = im.size
# 蓝方棋子约在原始坐标 (150-420, 40-180)，扫描该区域：
# 血条绿 #6fdc6f、血条黑底、护盾槽金色/白色微亮
def near(c, t, tol=28): return all(abs(a-b)<=tol for a,b in zip(c,t))
green = 0; blackbar = 0; whitish = 0; gold = 0; orange = 0
for y in range(40, 200):
    for x in range(120, 460):
        c = im.getpixel((x,y))
        if near(c, (111,220,111)): green += 1
        if near(c, (0,0,0), 40) and (y % 3 == 0): blackbar += 1
        if near(c, (240,192,64)): gold += 1
        if near(c, (255,154,60)): orange += 1
print('green_px', green, 'blackish_px', blackbar, 'gold_px', gold, 'orange_px', orange)
