window.onload = function(){
    
// =========
// =========
// =========

Array.prototype.find = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) return this[i];
    }
    return null;
}

Array.prototype.remove = function(obj){
    for (var i=0; i < this.length; i++) {
        if(this[i] == obj) this.splice(i, 1);
    }
    return this;
}

Array.prototype.contains = function(obj){
    for (var i=0; i < this.length; i++) {
        if(this[i] == obj) return true;
    }
    return false;
}


var R = Raphael("holder", 640, 480);

var S = {
    isDrag: false,
    connections: [],
    devices: []
}

// drag & drop

document.onmousemove = function (e) {
    e = e || window.event;
    if (S.isDrag) {
        S.isDrag.item.translate(e.clientX - S.isDrag.dx, e.clientY - S.isDrag.dy);
        // refresh connections
        S.connections.forEach(function(con){ con.update() })
        
        R.safari();
        S.isDrag.dx = e.clientX;
        S.isDrag.dy = e.clientY;
    }
};

document.onmouseup = function(e){
    if(S.isDrag && S.isDrag.to){
        // find socket
        var socket = function findSocket(from, sck){
            var box = sck.pad.getBBox();
            var E = 5
            console.log(S.devices)
            for(var i=0; i<S.devices.length; i++){
                console.log(i)
                if(S.devices[i] != from.device){
                    var sockets;
                    console.log("from:")
                    console.log(from)
                    if(from.type == "INPUT") sockets = S.devices[i].sockets.output
                    else if(from.type == "OUTPUT") sockets = S.devices[i].sockets.input
                    
                    var s = sockets.find(function(e){
                        var b = e.pad.getBBox();
                        return (Math.abs(b.x - box.x) < E && Math.abs(b.y - box.y) < E); 
                    })
                    
                    if(s) return s;
                }
            }
            return null;
        }(S.isDrag.from, S.isDrag.to)
        
        if(socket){
            S.isDrag.from.connect(socket);
        }
        
        S.isDrag.to.remove();
    }
    S.isDrag = false;
}


function SocketConnection(obj1, obj2){
    this.from = obj1;
    this.to   = obj2;
    
    // Return [path, x1, y1, x4, y4]
    this.calculatePathAndBullets = function(){
        var bb1 = this.from.pad.getBBox();
        var bb2 = this.to.pad.getBBox();

        var x1 = bb1.x + bb1.width / 2
        var y1 = bb1.y + bb1.height / 2
        var x4 = bb2.x + bb2.width / 2
        var y4 = bb2.y + bb2.height / 2

        var x2 = x1 + (x4 - x1)/2
        var y2 = y1
        var x3 = x4 + (x1 - x4)/2
        var y3 = y4

        path = ["M", x1, y1, "C", x2, y2, x3, y3, x4, y4].join(",");

        return [path, x1, y1, x4, y4];
    }
    
    var d = this.calculatePathAndBullets();
    this.path = d[0];    
    this.line = R.path(d[0]).attr({stroke: "#fff", fill: "none", "stroke-width": 3});
    this.bulletFrom = R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
    this.bulletTo = R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});
    
    var self = this;
    this.line.dblclick(function(){
        console.log("remove line")
        self.remove();
    })

    this.update = function(){
        var d = this.calculatePathAndBullets();
        this.line.attr({path: d[0]});
        this.bulletFrom.attr({cx: d[1], cy: d[2]});
        this.bulletTo.attr({cx: d[3], cy: d[4]});
    }
    
    this.remove = function(){
        this.from.disconnect(this.to)
        this.line.remove();
        this.bulletFrom.remove();
        this.bulletTo.remove();
        S.connections.remove(this)
    }
}

function Socket(device, x, y, type){
    this.device = device;
    this.type = type;
    
    var self = this;
    var color = function(t){
        if(t == "INPUT") return ["#f00", "#333"];
        else if(t == "OUTPUT") return ["#0f0", "#333"];
        else if(t == "MOUSE") return ["none", "none"];
    }(type);

    this.pad = R.circle(x, y, 5).attr({stroke: color[0],  "stroke-width": 2, fill: color[1]})
    
    this.pad.mousedown(function(e){
        console.log(self.pad.attrs.cx)
        var mSocket = new Socket(null, self.pad.attrs.cx, self.pad.attrs.cy, "MOUSE")
        self.connect(mSocket);
        
        S.isDrag = {
            dx: e.clientX,
            dy: e.clientY,
            from: self,
            to: mSocket,
            item: mSocket.pad
        }
        // this.animate({"fill-opacity": .2}, 500);
        e.preventDefault && e.preventDefault();
    })

    this.connectedSockets = [];
    this.connect = function(other){
        var self = this;
        if(S.connections.find(function(e){
            return (e.from == self && e.to == other) || (e.from == other && e.to == self);
        }) == null){
            S.connections.push(new SocketConnection(this, other))
            this.connectedSockets.push(other);
        }
    }
    
    this.disconnect = function(other){
        var self = this
        var con = S.connections.find(function(e){
            return (e.from == self && e.to == other) || (e.from == other && e.to == self);
        })
        
        this.connectedSockets.remove(other)
        other.connectedSockets.remove(this)
    }
    
    this.disconnectAll = function(){
        var self = this;
        S.connections.forEach(function(con){
            if(con.from == self || con.to == self){
                con.remove()
            }
            self.connectedSockets = [];
        })
    }
    
    this.remove = function(){
        this.disconnectAll();
        this.pad.remove();
    }
    
}

function Device(opts){
    var self = this;
    this.sockets = {
        input: [],
        output: []
    }
    
    this.set = R.set();
    
    opts.input.forEach(function(socket, i){
        var s = new Socket(self, opts.x + 10, opts.y + 25 + i * 15, "INPUT")
        self.sockets.input.push(s);
        self.set.push(s.pad);
    })
    
    opts.output.forEach(function(socket, i){
        var s = new Socket(self, opts.x + 90, opts.y + 25 + i * 15, "OUTPUT")
        self.sockets.output.push(s);
        self.set.push(s.pad);
    })
    
    var height = Math.max(this.sockets.input.length, this.sockets.output.length);
    this.border = R.rect(opts.x, opts.y, 100, 25 + height * 15, 5).attr({stroke: "#ccc", fill: "#333"});
    this.header = R.rect(opts.x, opts.y, 100, 15, 5).attr({stroke: "#ccc", fill: "#ccc"});
    
    this.set.push(this.header, this.border)
    
    this.header.toBack();
    this.border.toBack();
    
    this.header.mousedown(function(e){
        S.isDrag = {
            dx: e.clientX,
            dy: e.clientY,
            item: self.set
        }
        e.preventDefault && e.preventDefault();
    })
    
    this.header.mouseup(function(e){
        S.isDrag = false;
    })
    
    S.devices.push(this)
}


var a = new Device({
    x: 50,
    y: 50,
    input: [{}, {}],
    output: [{}, {}, {}, {}]
})

var b = new Device({
    x: 200,
    y: 100,
    input: [{}, {}, {}, {}, {}, {}, {}],
    output: [{}, {}, {}, {}]
})

// a.sockets.input[0].connect(b.sockets.output[0])
// a.sockets.input[1].connect(b.sockets.output[1])
// a.sockets.input[1].connect(b.sockets.output[2])
// a.sockets.input[1].connect(b.sockets.output[3])




// var a = new Socket(50, 50);
// var b = new Socket(100, 200);

// var con = new SocketConnection(d.sockets.input[0], d.sockets.output[2]);

// =========
// =========
// =========

}

