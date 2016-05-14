# process.py
#
# Loads aspectstargb.terra and converts it into the necessary image files,
# with the eventual goal of allowing for multiple in-game palettes.

from pixelgrid import *
import tkinter as tk
import json

gbpalette = [
    (0, 0, 0), # Transparent
    (136, 176, 88), # Color 2
    (72, 104, 32), # Color 3
    (40, 48, 24), # Color 4
    (184, 216, 128), # Color 1
]

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
    
tk.Tk() # Initialize Tk system

pixelgrid = PixelGrid(gbpalette)
with open("../aspectstargb.terra", "r") as fileo:
    pixelgrid.load(json.load(fileo))

process(gbpalette, "../")