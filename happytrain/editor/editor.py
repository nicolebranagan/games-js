import math
import json
import tkinter as tk
from tkinter import filedialog
from PIL import ImageTk, Image

class Application(tk.Frame):
    def __init__(self, master=None):
        tk.Frame.__init__(self, master)
        self.master = master
        self.pack()

        self.select = 0

        self.tiles = Image.open("../images/train_map.png")
        self.tiles = self.tiles.resize(
                (self.tiles.width * 2, self.tiles.height * 2),
                Image.NEAREST)
        self.tileset = self._getTileset()
        self.tilesTk = ImageTk.PhotoImage(self.tiles)
        self.createWidgets()
        
        self.roomset = RoomGrid(self.tileset, 6)
        self.currentx = 0
        self.currenty = 0
        self.room = self.roomset.getroom(0,0)

        self.drawroom()
        self.drawgrid(0,0)

    def _getTileset(self):
        return [self.tiles.crop((x*32,0,(x+1)*32,32)) for x in
                range(0, int(self.tiles.width // 32))]

    def createWidgets(self):
        self.master.bind("<Up>", lambda x: self.movegrid(0, -1))
        self.master.bind("<Down>", lambda x: self.movegrid(0, 1))
        self.master.bind("<Left>", lambda x: self.movegrid(-1, 0))
        self.master.bind("<Right>", lambda x: self.movegrid(1, 0))
        
        self.tilecanvas = tk.Canvas(self, width=self.tiles.width,
                                    height=self.tiles.height)
        self.tilecanvasimg = self.tilecanvas.create_image(
                0,0,anchor=tk.NW,image=self.tilesTk)
        self.tilecanvas.grid(row=0, column=0, columnspan = 3)
        self.tilecanvas.bind("<Button-1>", self.tileclick)
        
        self.gridcanvas = tk.Canvas(self, width=6*32, height=6*32)
        self.gridcanvas.grid(row=1, column=0)
        self.gridcanvasimage = self.gridcanvas.create_image(0,0,anchor=tk.NW)

        self.viewcanvas = tk.Canvas(self, width=320*2, height=192*2)
        self.viewcanvas.grid(row=1, column=1)
        self.viewcanvasimage = self.viewcanvas.create_image(0,0,anchor=tk.NW)
        self.viewcanvas.bind("<Button-1>", self.viewclick)
        self.viewcanvas.bind("<B1-Motion>", self.viewclick)
        self.viewcanvas.bind("<Motion>", self.viewmove)
        self.viewcanvas.bind("<Button-2>", self.cviewclick)
        self.viewcanvas.bind("<Button-3>", self.rviewclick)

        self.objectview = []

        controls = tk.Frame(self, width=6*32, height=6*32)
        controls.grid(row=1, column=2)
        loadbutton = tk.Button(controls, text="Open", command=self.open)
        loadbutton.grid(row=0, column=0)
        savebutton = tk.Button(controls, text="Save", command=self.save)
        savebutton.grid(row=0, column=1)

        self.objectlist = tk.Listbox(controls)
        self.objectlist.grid(row=1, column=0, columnspan=2)
        self.xentry = tk.Entry(controls, width=3)
        self.xentry.insert(0, "0")
        self.xentry.grid(row=2, column=0)
        self.yentry = tk.Entry(controls, width=3)
        self.yentry.insert(0, "0")
        self.yentry.grid(row=2, column=1)
        addenemybutton = tk.Button(controls, text="Add enemy",
                                   command=lambda: self.addobject(0) )
        addenemybutton.grid(row=3, column=0, columnspan=2, sticky=tk.W)
        addpassbutton = tk.Button(controls, text="Add passenger",
                                   command=lambda: self.addobject(1) )
        addpassbutton.grid(row=4, column=0, columnspan=2, sticky=tk.W)
        addcentbutton = tk.Button(controls, text="Add cent coin",
                                   command=lambda: self.addobject(2) )
        addcentbutton.grid(row=5, column=0, columnspan=2, sticky=tk.W)
        adddollbutton = tk.Button(controls, text="Add dollar coin",
                                   command=lambda: self.addobject(3) )
        adddollbutton.grid(row=6, column=0, columnspan=2, sticky=tk.W)
        delbutton = tk.Button(controls, text="Delete selection",
                                   command=self.deleteobj )
        delbutton.grid(row=7, column=0, columnspan=2, sticky=tk.W)

        self.statusbar = tk.Label(self, text="Loaded successfully!", bd=1,
                                  relief=tk.SUNKEN, anchor=tk.W)
        self.statusbar.grid(row=2, column=0, columnspan=3, sticky=tk.W+tk.E)

    def drawroom(self):
        self.roomimg = self.room.draw()
        self.roomimgTk = ImageTk.PhotoImage(self.roomimg)
        self.viewcanvas.itemconfig(self.viewcanvasimage,
                                   image=self.roomimgTk)

        [self.viewcanvas.delete(x) for x in self.objectview]
        for x in self.room.objects:
            color = "#FF0000"
            signif = "e"
            if x[0] == 1:
                color = "#0000FF"
                signif = "p"
            elif x[0] == 2:
                color = "#00AA00"
                signif = "c"
            elif x[0] == 3:
                color = "#00FF00"
                signif = "$"
            self.objectview.append(self.viewcanvas.create_text((
                                   x[1]*32+16, x[2]*32+16), fill=color,
                                   text=signif))

    def drawgrid(self,x,y):
        self.gridimg = self.roomset.draw(x, y)
        self.gridcanvas.itemconfig(self.gridcanvasimage,
                                   image=self.gridimg)

    def tileclick(self, event):
        x = math.floor(self.tilecanvas.canvasx(event.x) / 32)
        #y = math.floor(self.tilecanvas.canvasy(event.y) / 32)

        self.select = x

    def viewclick(self, event):
        clickX = math.floor(self.viewcanvas.canvasx(event.x) / 32)
        clickY = math.floor(self.viewcanvas.canvasy(event.y) / 32)
        
        if self.room.get(clickX, clickY) != self.select:
            self.room.set(clickX, clickY, self.select)
            self.drawroom()

    def cviewclick(self, event):
        clickX = math.floor(self.viewcanvas.canvasx(event.x) / 32)
        clickY = math.floor(self.viewcanvas.canvasy(event.y) / 32)
        self.xentry.delete(0, tk.END)
        self.xentry.insert(0, str(clickX))
        self.yentry.delete(0, tk.END)
        self.yentry.insert(0, str(clickY))

    def rviewclick(self, event):
        clickX = math.floor(self.viewcanvas.canvasx(event.x) / 32)
        clickY = math.floor(self.viewcanvas.canvasy(event.y) / 32)
        self.select = self.room.get(clickX, clickY)

    def viewmove(self, event):
        clickX = math.floor(self.viewcanvas.canvasx(event.x) / 32)
        clickY = math.floor(self.viewcanvas.canvasy(event.y) / 32)
        
        self.statusbar.config(
                text="Coordinates: {}, {}".format(clickX, clickY))

    def movegrid(self, x, y):
        newx = self.currentx + x
        newy = self.currenty + y

        if (newx >= 0 and newx < 6 and
            newy >= 0 and newy < 6):
            self.currentx = newx
            self.currenty = newy
            self.room = self.roomset.getroom(self.currentx, self.currenty)
            self.drawgrid(self.currentx, self.currenty)
            self.drawroom()
            self.objectlist.delete(0, tk.END)
            [self.objectlist.insert(i, "{}, {}, {}".format(*x)) 
                for i,x in enumerate(self.room.objects)]

    def save(self):
        filen = filedialog.asksaveasfilename(
                defaultextension=".json",
                initialfile="world.json",
                initialdir="../",
                filetypes=(("JSON files", "*.json"),
                           ("All files", "*")),
                title="Save")
        if filen != () and filen != "":
            with open(filen, "w") as fileo:
                json.dump(self.roomset.dump(), fileo)

    def open(self):
        filen = filedialog.askopenfilename(
                defaultextension=".json",
                initialfile="world.json",
                initialdir="../",
                filetypes=(("JSON files", "*.json"),
                           ("All files", "*")),
                title="Save")
        if filen != () and filen != "":
            with open(filen, "r") as fileo:
                self.roomset.load(json.load(fileo))
            self.drawgrid(0,0)
            self.currentx = 0
            self.currenty = 0
            self.room = self.roomset.getroom(0,0)
            self.drawroom()
            self.objectlist.delete(0, tk.END)
            [self.objectlist.insert(i, "{}, {}, {}".format(*x)) 
                for i,x in enumerate(self.room.objects)]

    def addobject(self, objid):
        newobj = (objid, int(self.xentry.get()), int(self.yentry.get()), True)
        text = "{}, {}, {}".format(*newobj)
        self.objectlist.insert(len(self.room.objects), text)
        self.room.objects.append(newobj)
        self.drawroom()

    def deleteobj(self):
        todel = self.objectlist.curselection()
        if len(todel) == 0:
            # Nothing to delete
            return

        self.objectlist.delete(todel[0])
        self.room.objects.pop(todel[0])
        self.drawroom()

class Room:
    def __init__(self, tileset):
        self.width = 20
        self.height = 12
        self.tileset = tileset
        self.tiles = [0 for x in range(0,self.width*self.height)]
        self.objects = []

    def set(self, x, y, v):
        if x >= self.width or y >= self.height or x < 0 or y < 0:
            return
        self.tiles[x + y*self.width] = v

    def get(self, x, y):
        if x >= self.width or y >= self.height or x < 0 or y < 0:
            return 0
        return self.tiles[x + y*self.width]

    def draw(self):
        image = Image.new("RGB",(self.width*32, self.height*32))
        i = 0
        for y in range(0, 12):
            for x in range(0, 20):
                image.paste(self.tileset[self.tiles[i]],(x*32, y*32))
                i = i+1
        return image

    def dump(self):
        return {"tiles": self.tiles,
                "objects": self.objects}

    @staticmethod
    def load(loaded, tileset):
        self = Room(tileset)
        self.tiles = loaded["tiles"]
        self.objects = loaded["objects"]
        return self

class RoomGrid:
    def __init__(self, tileset, l):
        self.l = l
        self.tileset = tileset
        self.rooms = [0 for x in range(0,self.l*self.l)]

    def getroom(self, x, y):
        if self.rooms[x + self.l * y] == 0:
            self.rooms[x + self.l * y] = Room(self.tileset)
        return self.rooms[x + self.l * y]

    def draw(self, x=-1, y=-1):
        image = tk.PhotoImage(width=self.l*32, height=self.l*32)
        for i in range(0, self.l):
            for j in range(0, self.l):
                color = "#404040"
                if x == i and y == j:
                    color = "#F00000"
                elif self.rooms[i + self.l * j] != 0:
                    color = "#999999"
                image.put("#000000", to=(i*32 + 1, j*32 + 1, 
                                         (i+1) * 32 - 1, (j+1) * 32 - 1))
                image.put(color, to=(i*32 + 2, j*32 + 2, 
                                         (i+1) * 32 - 2, (j+1) * 32 - 2))

        return image

    def dump(self):
        return [x.dump() if isinstance(x, Room) else x for x in self.rooms]

    def load(self, dumped):
        self.rooms = [x if x == 0 else Room.load(x, self.tileset) 
                      for x in dumped]

root = tk.Tk()
app = Application(master=root)
app.mainloop()

