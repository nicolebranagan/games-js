import math
import json
import tkinter as tk
from tkinter import filedialog
from PIL import ImageTk, Image
from enum import Enum

TypeLabel = {
    "StillEnemy +" : 0,
    "StillEnemy x" : 1,
    "StillEnemy o" : 2,
    "Demon +" : 3,
    "Demon x" : 4,
    "Demon o" : 5,
    "Rat +" : 6,
    "Rat x" : 7,
    "Rat o" : 8,
    "Cube +" : 9,
    "Cube x" : 10,
    "Cube o" : 11,

    "4way" : 100,
    "Block +" : 101,
    "Block x" : 102,
    "Block o" : 103,
    "Save" : 104,
    "Key" : 105,
    "Lock": 106}
Type = {v: k for k, v in TypeLabel.items()}

RoomColor = {
    0 : "#999999",
    1 : "#BC88A0",
    2 : "#5699EE",
    3 : "#A088BC",
    4 : "#99EE59",
    5 : "#34DE66",
    6 : "#8899EE",
    7 : "#99EE88",
    8 : "#22EEFF",
    9 : "#670000"
}

class Application(tk.Frame):
    def __init__(self, master=None):
        tk.Frame.__init__(self, master)
        self.master = master
        self.pack()

        self.__select = 0

        self.tiles = Image.open("../images/train_map.png")
        self.tiles = self.tiles.resize(
                (self.tiles.width * 2, self.tiles.height * 2),
                Image.NEAREST)
        self.tileset = self._getTileset()
        self.tilesetTk = [ImageTk.PhotoImage(x) for x in self.tileset]
        self.tilesTk = ImageTk.PhotoImage(self.tiles)
        self.createWidgets()
        
        self.roomset = RoomGrid(self.tileset, 16)
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
        self.master.bind("<Delete>", self.delgrid)
       
        scrolltilecanvas = tk.Scrollbar(self, orient=tk.HORIZONTAL)
        scrolltilecanvas.grid(row=1, column=0, columnspan=4, sticky=tk.W+tk.E)
        self.tilecanvas = tk.Canvas(self, 
                                    scrollregion=(0,0,self.tiles.width,
                                                  self.tiles.height),
                                    height=self.tiles.height,
                                    xscrollcommand=scrolltilecanvas.set)
        self.tilecanvasimg = self.tilecanvas.create_image(
                0,0,anchor=tk.NW,image=self.tilesTk)
        self.tilecanvas.grid(row=0, column=0, columnspan=4, sticky=tk.W+tk.E)
        self.tilecanvas.bind("<Button-1>", self.tileclick)
        scrolltilecanvas.config(command=self.tilecanvas.xview)

        self.gridcanvas = tk.Canvas(self, width=320, height=320)
        self.gridcanvas.grid(row=2, column=0)
        self.gridcanvasimage = self.gridcanvas.create_image(0,0,anchor=tk.NW)
        self.gridcanvas.bind("<Button-1>", self.gridclick)

        viewpanel = tk.Frame(self)
        viewpanel.grid(row=2, column=1)
        self.viewcanvas = tk.Canvas(viewpanel, width=160*2, height=(144-16)*2)
        self.viewcanvas.grid(row=0, column=0,columnspan=2)
        self.viewcanvasimage = self.viewcanvas.create_image(0,0,anchor=tk.NW)
        self.viewcanvas.bind("<Button-1>", self.viewclick)
        self.viewcanvas.bind("<B1-Motion>", self.viewclick)
        self.viewcanvas.bind("<Motion>", self.viewmove)
        self.viewcanvas.bind("<Button-2>", self.cviewclick)
        self.viewcanvas.bind("<Button-3>", self.rviewclick)
        self.spinner = tk.Spinbox(viewpanel, from_=0, to=99, 
                             command=lambda *x: 
                             self.room.setarea(int(self.spinner.get())))
        self.spinner.grid(row=1, column=0)

        self.objectview = []

        controls = tk.Frame(self, width=12*32, height=12*32)
        controls.grid(row=2, column=2)
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
        
        delbutton = tk.Button(controls, text="Delete selection",
                                   command=self.deleteobj )
        delbutton.grid(row=3, column=0, columnspan=2, sticky=tk.W)
        
        self.selectedblock = tk.StringVar(self)
        self.selectedblock.set(Type[100])
        tk.OptionMenu(
                controls, self.selectedblock, 
                *[Type[x] for x in range(100,107)]).grid(
                    row=4, column=0)
        addblockbutton = tk.Button(controls, text="Add", 
                                   command=lambda: self.addobject(
                                       self.selectedblock.get) )
        addblockbutton.grid(row=4, column=1, sticky=tk.W)

        self.selectedenemy = tk.StringVar(self)
        self.selectedenemy.set(Type[0])
        tk.OptionMenu(
                controls, self.selectedenemy, 
                *[Type[x] for x in range(0,12)]).grid(
                    row=5, column=0)
        addenemybutton = tk.Button(controls, text="Add",
                                   command=lambda: self.addobject(
                                       self.selectedenemy.get) )
        addenemybutton.grid(row=5, column=1, sticky=tk.W)
        
        self.arbitraryentry = tk.Entry(controls, width=3)
        self.arbitraryentry.insert(0, "200")
        self.arbitraryentry.grid(row=6, column=0)
        
        addenemybutton = tk.Button(controls, text="Add",
                                   command=self.addarbitrary )
        addenemybutton.grid(row=6, column=1, sticky=tk.W)

        tilepanel = tk.Frame(self)
        tilepanel.grid(row=2, column=3)
        tk.Label(tilepanel, text="Current tile:").pack()
        self.currenttileimg = ImageTk.PhotoImage(self.tileset[self.select])
        self.currenttile = tk.Label(tilepanel, image=self.currenttileimg)
        self.currenttile.pack()
        self.tiletypevar = tk.IntVar()
        tk.Radiobutton(tilepanel, text="Clear", variable=self.tiletypevar,
                       value=0, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="Solid", variable=self.tiletypevar,
                       value=1, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="Pit/Water", variable=self.tiletypevar,
                       value=8, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="Aspect +", variable=self.tiletypevar,
                       value=2, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="Aspect x", variable=self.tiletypevar,
                       value=3, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="Aspect o", variable=self.tiletypevar,
                       value=4, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="No Enemies", variable=self.tiletypevar,
                       value=5, command=self.changetype).pack()
        tk.Radiobutton(tilepanel, text="No Player", variable=self.tiletypevar,
                       value=6, command=self.changetype).pack()

        self.statusbar = tk.Label(self, text="Loaded successfully!", bd=1,
                                  relief=tk.SUNKEN, anchor=tk.W)
        self.statusbar.grid(row=3, column=0, columnspan=4, sticky=tk.W+tk.E)

    def drawroom(self):
        self.roomimg = self.room.draw()
        self.roomimgTk = ImageTk.PhotoImage(self.roomimg)
        self.viewcanvas.itemconfig(self.viewcanvasimage,
                                   image=self.roomimgTk)

        [self.viewcanvas.delete(x) for x in self.objectview]
        for x in self.room.objects:
            if x[0] >= 200:
                color = "#00AA00"
                self.objectview.append(self.viewcanvas.create_text((
                                       x[1]*32+16, x[2]*32+16), fill=color,
                                       text=str(x[0]),
                                       font=('Helvetica', -16)))
            elif x[0] >= 100:
                self.objectview.append(
                        self.viewcanvas.create_image(
                            x[1]*32+16, x[2]*32+16, 
                            image=self.tilesetTk[x[0]-100+9]))
                self.objectview.append(
                        self.viewcanvas.create_rectangle(
                            x[1]*32, x[2]*32, x[1]*32+32-1, x[2]*32+32-1,
                            outline='blue'))
            else:
                color = "#FF0000"
                signif = Type[x[0]][-1]
                self.objectview.append(self.viewcanvas.create_text((
                                       x[1]*32+16, x[2]*32+16), fill=color,
                                       text=signif,
                                       font=('Helvetica', -32)))

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

    def gridclick(self, event):
        clickX = math.floor(self.gridcanvas.canvasx(event.x) / 20)
        clickY = math.floor(self.gridcanvas.canvasy(event.y) / 20)
        self.movegrid(clickX, clickY, False)

    def movegrid(self, x, y, relative=True):
        if relative:
            newx = self.currentx + x
            newy = self.currenty + y
        else:
            newx = x
            newy = y

        if (newx >= 0 and newx < 16 and
            newy >= 0 and newy < 16):
            self.currentx = newx
            self.currenty = newy
            self.room = self.roomset.getroom(self.currentx, self.currenty)
            self.spinner.delete(0,"end")
            self.spinner.insert(0,self.room.area)
            self.drawgrid(self.currentx, self.currenty)
            self.drawroom()
            self.objectlist.delete(0, tk.END)
            #[self.objectlist.insert(i, "{}, {}, {}".format(*x)) 
            #    for i,x in enumerate(self.room.objects)]
            for i,x in enumerate(self.room.objects):
                if (x[0] >= 200):
                    self.objectlist.insert(
                        i, "Arbitrary {}: {}, {}".format(*x))
                else:
                    self.objectlist.insert(
                        i, "{}: {}, {}".format(Type[x[0]], x[1], x[2]))
            self.statusbar.config(
                    text="Loaded room X:{}, Y:{}".format(newx, newy))

    def delgrid(self, *args):
        self.roomset.delroom(self.currentx, self.currenty)
        self.movegrid(0,0,False)

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
            for i,x in enumerate(self.room.objects):
                if (x[0] >= 200):
                    self.objectlist.insert(
                        i, "Arbitrary {}: {}, {}".format(*x))
                else:
                    self.objectlist.insert(
                        i, "{}: {}, {}".format(Type[x[0]], x[1], x[2]))

    def addobject(self, source):
        val = source();
        if (val == ""):
            return
        blockid = TypeLabel[val]
        newobj = (blockid, int(self.xentry.get()), int(self.yentry.get()), True)
        text = "{}: {}, {}".format(val, newobj[1], newobj[2])
        self.objectlist.insert(len(self.room.objects), text)
        self.room.objects.append(newobj)
        self.drawroom()
    
    def addarbitrary(self):
        val = int(self.arbitraryentry.get())
        if (val == ""):
            return
        newobj = (val, int(self.xentry.get()), int(self.yentry.get()), True)
        text = "Arbitrary {}: {}, {}".format(val, newobj[1], newobj[2])
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

    @property
    def select(self):
        return self.__select

    @select.setter
    def select(self, value):
        self.__select = value
        self.currenttileimg = ImageTk.PhotoImage(self.tileset[self.select])
        self.currenttile.config(image=self.currenttileimg)
        self.tiletypevar.set(self.roomset.key[self.select])

    def changetype(self, *args):
        self.roomset.key[self.select] = self.tiletypevar.get()

class Room:
    def __init__(self, tileset):
        self.width = 10
        self.height = 8
        self.tileset = tileset
        self.area = 0
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

    def setarea(self, x):
        self.area = x

    def draw(self):
        image = Image.new("RGB",(self.width*32, self.height*32))
        i = 0
        for y in range(0, 8):
            for x in range(0, 10):
                image.paste(self.tileset[self.tiles[i]],(x*32, y*32))
                i = i+1
        return image

    def dump(self):
        return {"tiles": self.tiles,
                "objects": self.objects,
                "area": self.area}

    @staticmethod
    def load(loaded, tileset):
        self = Room(tileset)
        self.tiles = loaded["tiles"]
        self.objects = loaded["objects"]
        self.area = loaded["area"]
        return self

class RoomGrid:
    def __init__(self, tileset, l):
        self.l = l
        self.tileset = tileset
        self.rooms = [0 for x in range(0,self.l*self.l)]
        self.key = [0] * len(tileset)

    def getroom(self, x, y):
        if self.rooms[x + self.l * y] == 0:
            self.rooms[x + self.l * y] = Room(self.tileset)
        return self.rooms[x + self.l * y]

    def delroom(self, x, y):
        self.rooms[x + self.l * y] = 0

    def draw(self, x=-1, y=-1):
        image = tk.PhotoImage(width=self.l*64, height=self.l*64)
        for i in range(0, self.l):
            for j in range(0, self.l):
                color = "#404040"
                if x == i and y == j:
                    color = "#F00000"
                elif self.rooms[i + self.l * j] != 0:
                    color = RoomColor[self.rooms[i+self.l*j].area]
                    #color = "#999999"
                image.put("#000000", to=(i*20 + 1, j*20 + 1, 
                                         (i+1) * 20 - 1, (j+1) * 20 - 1))
                image.put(color, to=(i*20 + 2, j*20 + 2, 
                                         (i+1) * 20 - 2, (j+1) * 20 - 2))

        return image

    def dump(self):
        output = {}
        output["rooms"] = [x.dump() if isinstance(x, Room) else x 
            for x in self.rooms]
        output["key"] = self.key
        return output

    def load(self, dumped):
        self.rooms = [x if x == 0 else Room.load(x, self.tileset) 
                      for x in dumped["rooms"]]
        self.key = dumped["key"]

root = tk.Tk()
app = Application(master=root)
app.mainloop()

