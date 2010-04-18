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

Raphael.fn.slider = function(x, y, min, max){
    var s = this.set();
    s.min = min;
    s.max = max;
    
    s.rect = R.rect(x, y, 10, 150, 5).attr({fill: "#555"})
    s.knob = R.circle(x+5, y+70, 6, 6).attr({fill: "#f00", stroke: "#fff"})
    s.knob.mousedown(function(e){
        S.isDrag = {
            dx: e.clientX,
            dy: e.clientY,
            item: s.knob,
            orientation: "vertical",
            yMin: y,
            yMax: y+100
        }
        e.preventDefault && e.preventDefault();
    })
    
    
    
    s.push(s.rect)
    s.push(s.knob)
    return s;
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
        var tx = (S.isDrag.orientation && S.isDrag.orientation == "vertical") ? 0 : e.clientX - S.isDrag.dx
        var ty = (S.isDrag.orientation && S.isDrag.orientation == "horizontal") ? 0 : e.clientY - S.isDrag.dy
        
        console.log(S.isDrag.dy)
        
        // if(S.isDrag.x){
        //     S.isDrag.x.current += tx
        //     if(S.isDrag.x.current > S.isDrag.x.max){
        //         tx = S.isDrag.x.current - S.isDrag.x.max;
        //         S.isDrag.x.current = S.isDrag.x.max
        //     } else if(S.isDrag.x.current < S.isDrag.x.min){
        //         tx = S.isDrag.x.min - S.isDrag.x.current;
        //         S.isDrag.x.current = S.isDrag.x.min
        //     }
        // } 
        // 
        // if(S.isDrag.y){
        //     S.isDrag.y.current += tx
        //     if(S.isDrag.y.current > S.isDrag.y.max){
        //         ty = S.isDrag.y.current - S.isDrag.y.max;
        //         S.isDrag.y.current = S.isDrag.y.max
        //     } else if(S.isDrag.y.current < S.isDrag.y.min){
        //         ty = S.isDrag.y.min - S.isDrag.y.current;
        //         S.isDrag.y.current = S.isDrag.y.min
        //     }
        // }
        
        S.isDrag.item.translate(tx, ty);
        
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
            var E = 7
            for(var i=0; i<S.devices.length; i++){
                if(S.devices[i] != from.device){
                    var sockets;
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
    e.preventDefault && e.preventDefault();
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
        self.remove();
    })
	
	this.line.hover(function(){
		this.attr({stroke:"#ff0"});
	}, function(){
		this.attr({stroke:"#fff"})
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

function Socket(device, x, y, type, opts){
    if(!opts) opts = {name:""}
    this.device = device;
    this.type = type;
    
    var self = this;
    var color = function(t){
        if(t == "INPUT") return ["#f00", "#333"];
        else if(t == "OUTPUT") return ["#0f0", "#333"];
        else if(t == "MOUSE") return ["none", "none"];
    }(type);

    this.pad = R.circle(x, y, 5).attr({stroke: color[0],  "stroke-width": 2, fill: color[1]})
    this.label = R.set();
    this.label.push(R.rect(x-30, y+20, 60, 20, 3).attr({stroke: "#555", fill: "#333"}))
    this.label.push(R.text(x, y+31, opts.name).attr({fill: "#ccc", "text-align": "left", "font-family": "Monaco", "font-size": "9px"}))
    this.label.hide();
    
    this.pad.mousedown(function(e){
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
    
    this.pad.hover(function(){
        self.label.show();
    }, function(){
        self.label.hide();
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
    
    this.send = function(data){
        this.connectedSockets.forEach(function(s){
            s.fun(data);
        })
    }
    
    this.fun = opts.fun
    
}

function Device(opts){
    var self = this;
    this.sockets = {
        input: [],
        output: []
    }
    
    this.set = R.set();
    
    opts.input.forEach(function(socket, i){
        var s = new Socket(self, opts.x + 10, opts.y + 30 + i * 15, "INPUT", socket)
        self.sockets.input.push(s);
        self.set.push(s.pad);
        self.set.push(s.label);
    })
    
    opts.output.forEach(function(socket, i){
        var s = new Socket(self, opts.x + 90, opts.y + 30 + i * 15, "OUTPUT", socket)
        self.sockets.output.push(s);
        self.set.push(s.pad);
        self.set.push(s.label);
    })
    
    var size = opts.size || Math.max(this.sockets.input.length, this.sockets.output.length);
    this.border = R.rect(opts.x, opts.y, 100, 30 + size * 15, 5).attr({stroke: "#ccc", fill: "#333"});
    this.header = R.rect(opts.x, opts.y, 100, 18, 5).attr({stroke: "#ccc", fill: "#ccc"});
    this.headerText = R.text(opts.x + 50, opts.y+9, opts.name).attr({stroke: "#444", "font-family": "Monaco", "font-size": "11px"})
    
    this.set.push(this.header, this.border, this.headerText)
    
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
        e.preventDefault && e.preventDefault();
    })
    
    S.devices.push(this)
}



var serial = new Device({
    name: "Serial",
    x: 50,
    y: 50,
    input: [{
        name: "INPUT",
        fun: function(data){
            alert("Serial: " + data)
        }
    }],
    output: [{name: "OUTPUT"}]
})

var piast = new Device({
    name: "Piast",
    x: 250,
    y: 50,
    input: [{
        name: "INPUT",
		fun: function(data){ 
		    alert("piast: " + data) 
		    piast.sockets.output[0].send(data)
		}
    }],
    output: [
        {name: "OUTPUT"}
    ]
})

var debug = new Device({
    name: "Debug",
    x: 250,
    y: 150,
    input: [{
        name: "INPUT",
		fun: function(data){ 
            if(debug.value){
                debug.value.remove();
            }
            debug.value = R.text(debug.header.attrs.x + 50, debug.header.attrs.y + 30, data).attr({stroke: "#fff", "font-family": "Monaco", "font-size": "11px"})
		    debug.set.push(debug.value)
		}
    }],
    output: []
})

//
//var slider = new Device({
//    name: "Slider",
//    x: 50,
//    y: 150,
//    input: [],
//    output: [{
//        name: "VALUE"
//    }],
//    size: 11
//})


//R.slider(200, 200, 0, 100)




// slider.s = R.rect(0, 0, 0, 0)
// slider.set.push(slider.s)
// 
// slider.s.v = $("#slider-vertical").slider({
//     orientation: "vertical",
//     range: "min",
//     min: 0,
//     max: 100,
//     value: 60,
//     slide: function(event, ui){
//         console.log(ui.value)
//         slider.sockets.output[0].send(ui.value)
//     }
// }).css("left", slider.header.attrs.x + 40 + "px").css("top", slider.header.attrs.y + 30 + "px")
// slider.s.translate = function(x,y){
//     slider.s.v.css("top", parseInt(slider.s.v.css("top")) + y + "px")
//     slider.s.v.css("left", parseInt(slider.s.v.css("left")) + x + "px")
// }



var j=0;
//R.rect(10, 10, 20, 20, 5).attr({fill: "#f90"}).click(function(e){
//    serial.sockets.output[0].send(1234 + j++)
//    e.preventDefault && e.preventDefault()
//})

// var a = new Device({
//     x: 350,
//     y: 350,
//     input: [{}, {}],
//     output: [{}, {}, {}, {}]
// })
// 
// var b = new Device({
//     x: 200,
//     y: 100,
//     input: [{}, {}, {}, {}, {}, {}, {}],
//     output: [{}, {}, {}, {}]
// })



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

