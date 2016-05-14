# process.py
#
# Loads aspectstargb.terra and converts it into the necessary image files,
# with the eventual goal of allowing for multiple in-game palettes.

from pixelgrid import *
import tkinter as tk
import json
import csv

gbpalette = [
    (0, 0, 0), # Transparent
    (136, 176, 88), # Color 2
    (72, 104, 32), # Color 3
    (40, 48, 24), # Color 4
    (184, 216, 128), # Color 1
]

def rgb(hex_color):
    split = (hex_color[1:3], hex_color[3:5], hex_color[5:7])
    return tuple([int(x, 16) for x in split])

def process(palette, designation):
    pixelgrid.palette = palette
    
    # Tilemap (train_map.png)
    filen = designation + "train_map.png"
    pixelgrid.changepage(0)
    pixelgrid.getTkStrip(2, False).write(filen)
    
    # Objects (objects.png)
    filen = designation + "objects.png"
    pixelgrid.changepage(1)
    pixelgrid.getTkImage(1, block=False).write(filen)
    
    # Title (title.png)
    filen = designation + "title.png"
    pixelgrid.changepage(2)
    PixelSubset(pixelgrid, (0, 0, 20, 18)).getTkImage(1, block=False).write(filen)
    
    # Font (cgafont.png)
    filen = designation + "cgafont.png"
    pixelgrid.changepage(5)
    pixelgrid.getTkStrip(1, False).write(filen)
    
def process_cgb(marker, designation):
    # Tilemap (train_map.png)
    filen = designation + "train_map.png"
    pixelgrid.palette = bgpal[marker]
    pixelgrid.changepage(0)
    pixelgrid.getTkStrip(2, False).write(filen)
    
    # Blocks (block_map.png)
    filen = designation + "block_map.png"
    pixelgrid.palette = obj1pal[marker]
    pixelgrid.changepage(0)
    pixelgrid.getTkStrip(2, False).write(filen)
    
    # Objects (objects.png)
    filen = designation + "objects.png"
    pixelgrid.palette = obj0pal[marker]
    pixelgrid.changepage(1)
    pixelgrid.getTkImage(1, block=False).write(filen)
    
    # Title (title.png)
    filen = designation + "title.png"
    pixelgrid.palette = bgpal[marker]
    pixelgrid.changepage(2)
    PixelSubset(pixelgrid, (0, 0, 20, 18)).getTkImage(1, block=False).write(filen)
    
    # Font (cgafont.png)
    filen = designation + "cgafont.png"
    pixelgrid.palette = bgpal[marker]
    pixelgrid.changepage(5)
    pixelgrid.getTkStrip(1, False).write(filen)
    
tk.Tk() # Initialize Tk system

pixelgrid = PixelGrid(gbpalette)
with open("../aspectstargb.terra", "r") as fileo:
    pixelgrid.load(json.load(fileo))

process(gbpalette, "../")

bgpal = []
obj0pal = []
obj1pal = []
# CSV from The Cutting Room Floor
# https://tcrf.net/Game_Boy_Color_Bootstrap_ROM (CC-BY license)
with open("./listButtonCombos.csv", "r", newline="") as fileo:
    next(fileo) # Skip header
    reader = csv.reader(fileo, delimiter="\t")
    for datum in reader:
        bgpal.append(((0, 0, 0), rgb(datum[4]), rgb(datum[5]), rgb(datum[6]), rgb(datum[3])))
        obj0pal.append(((0, 0, 0), rgb(datum[8]), rgb(datum[9]), rgb(datum[10]), rgb(datum[7])))
        obj1pal.append(((0, 0, 0), rgb(datum[12]), rgb(datum[13]), rgb(datum[14]), rgb(datum[11])))

for i in range(0, len(bgpal)):
    desig = "../alt/" + str(i) + "-"
    process_cgb(i, desig)