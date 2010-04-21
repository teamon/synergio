// Array extensions

Array.prototype.remove = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) this.splice(i, 1);
    }
    return this;
}

Array.prototype.find = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) return this[i];
    }
    return null;
}

Object.prototype.merge = function(other){
    res = {};
    for(var p in this) res[p] = this[p];
    for(var p in other) res[p] = other[p];
    return res;
}

var Synergio = {
    width: 80,
    init: function(){
        Synergio.R = Raphael("holder", 640, 480)
    },
    
    loadPreset: function(name){
        Presets[name]()
    },
    
    devices: [],
    
    Device: function (opts){
        var device = {
            name: opts.name,
            inputs: [],
            outputs: [],
            set: Synergio.R.set(),
            width: opts.width || 80,
            height: opts.height
        }

        if(opts.inputs){
            opts.inputs.forEach(function(e, i){
                var sock = Synergio.Socket(device, e.name, "INPUT", e.fun)
                device.inputs.push(sock)
                device.set.push(sock.pad)
                sock.pad.translate(10, 30+i*15)
            })
        }

        if(opts.outputs){
            opts.outputs.forEach(function(e, i){
                var sock = Synergio.Socket(device, e.name, "OUTPUT", e.fun)
                device.outputs.push(sock)
                device.set.push(sock.pad)
                sock.pad.translate(Synergio.width-10, 30+i*15)
            })
        }
        
        var width = opts.width || Synergio.width

        var height = opts.height || 25 + Math.max(device.inputs.length, device.outputs.length)*15

        device.border = Synergio.R.rect(0, 0, width, height, 5).attr({stroke: "#fff"})
        device.header = Synergio.R.rect(0, 0, width, 20, 5).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.3})
        device.name   = Synergio.R.text(width/2, 10, device.name).attr({"stroke-width": 0, fill: "#fff", "font-family": "Lucida Grande", "font-size": "11pt", "font-style": "normal"})
        device.set.push(device.border, device.header, device.name)

        function makeDraggable(obj){
            obj.draggable()
            obj.dragUpdate = function(dragging_over, dx, dy, event){
                device.set.translate(dx, dy)
                if(device.onDragUpdate) device.onDragUpdate(dragging_over, dx, dy, event)
                device.inputs.forEach( function(socket){ socket.updateConnections() })
                device.outputs.forEach(function(socket){ socket.updateConnections() })
            }
        }
        makeDraggable(device.header)
        makeDraggable(device.name)

        if(opts.coords){
            device.set.translate(opts.coords[0], opts.coords[1])
        }

        Synergio.devices.push(device);
        return device;
    },
    
    SocketConnection: function(obj1, obj2){
        var self = {};
        self.hovered = false;
        self.obj1 = obj1;
        self.obj2 = obj2;

        // Return [path, x1, y1, x4, y4]
        self.calculatePathAndBullets = function(){                        
            var bb1 = self.obj1.pad.getBBox();
            var bb2 = self.obj2.pad.getBBox();
    
            var x1 = bb1.x + bb1.width / 2
            var y1 = bb1.y + bb1.height / 2
            var x4 = bb2.x + bb2.width / 2
            var y4 = bb2.y + bb2.height / 2

            var x2 = x1 + (x4 - x1) / 2
            var y2 = y1
            var x3 = x4 + (x1 - x4) / 2
            var y3 = y4

            path = ["M", x1, y1, "C", x2, y2, x3, y3, x4, y4].join(",");
            
            return [path, x1, y1, x4, y4];
        }

        var d = self.calculatePathAndBullets();
        self.path = d[0];    
        self.line = Synergio.R.path(d[0]).attr({stroke: "#fff", fill: "none", "stroke-width": 3, "stroke-opacity": 0.5});
        self.bullet1 = Synergio.R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
        self.bullet2 = Synergio.R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});

        self.line.dblclick(function(){
            self.obj1.disconnectFrom(self.obj2)
            self.remove();
        })

        self.line.hover(function(){
            self.hovered = true
            this.attr({stroke:"#ff0"});
        }, function(){
            self.hovered = false
            this.attr({stroke:"#fff"})
        })

        self.update = function(){
            var d = this.calculatePathAndBullets();
            self.line.attr({path: d[0]});
            self.bullet1.attr({cx: d[1], cy: d[2]});
            self.bullet2.attr({cx: d[3], cy: d[4]});
        }

        self.remove = function(){
            self.line.remove();
            self.bullet2.remove();
            self.bullet1.remove();
        }
        
        self.send = function(from, data){
            if(self.obj1 == from && self.obj2.type == "INPUT") self.doSend(self.obj2, data)
            else if(self.obj2 == from && self.obj1.type == "INPUT") self.doSend(self.obj1, data)
        }
        
        self.doSend = function(to, data){
            to.fun(data)
            if(!self.hovered){
                self.line.attr({stroke: "#f00"})
                setTimeout(function(){
                    self.line.attr({stroke: "#fff"})
                }, 100)
            } else {
                self.line.attr({stroke:"#ff0"});
            }

        }
        
        return self;
    },
    
    Socket: function(device, name, type, fun){
        var self = {};
        self.device = device;
        self.name = name;
        self.type = type;
        self.fun = fun;
 
        function createPad(){
            var pad = Synergio.R.circle(0, 0, 4).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.0});
            pad.socket = self;
            pad.node.pad = pad;
            
            pad.hover(function(){
                pad.attr({stroke: "#000"})
            }, function(){
                pad.attr({stroke: "#fff"})
            })
            
            
            if(this.type != "mouse"){
                var p,m;
                pad.draggable()
                pad.dragStart = function(x, y, mousedownevent, mousemoveevent){
                    m = Synergio.Socket("mouse", "mouse")
                    m.pad.remove();
                    m.pad = pad;
                    
                    self.pad = createPad().attr({cx: pad.attrs.cx, cy: pad.attrs.cy})
                    self.device.set.push(self.pad)
                    self.connectWith(m)
                    p = pad;
                    return pad;
                }
                pad.dragUpdate = function(dragging_over, dx, dy, event){
                    p.translate(dx, dy)
                    self.updateConnections()
                }
                pad.dragFinish = function(dropped_on, x, y, event){
                    var sck;
                    var box = p.getBBox();
                    var E = 5;
                    
                    Synergio.devices.find(function(device){
                        if(device != self.device){
                            var sockets;
                            
                            if(self.type == "INPUT"){ sockets = device.outputs; }
                            else if(self.type == "OUTPUT"){ sockets = device.inputs; }
                            
                            var s = sockets.find(function(e){
                                var b = e.pad.getBBox();
                                return (Math.abs(b.x - box.x) < E && Math.abs(b.y - box.y) < E); 
                            })
                            
                            if(s){
                                sck = s;
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                        
                    })
                    
                    if(sck){ self.connectWith(sck) }
                    
                    self.disconnectFrom(m)
                    p.remove()
                }
            }
            
            return pad;
        }
        
        self.pad = createPad();
        
        self.connections = [];
        
        self.connectWith = function(that){
            var conn = Synergio.SocketConnection(self, that)
            self.connections.push(conn)
            that.connections.push(conn)
        }
        
        self.disconnectFrom = function(that){
            var pred = function(conn){
                if((conn.obj1 == self && conn.obj2 == that) || (conn.obj1 == that && conn.obj2 == self)){
                    conn.remove(); 
                    return true;
                } else {
                    return false;
                }
            }
            self.connections.remove(pred)
            self.connections.remove(pred)
        }
        
        self.updateConnections = function(){
            self.connections.forEach(function(conn){ conn.update() })
        }
        
        self.send = function(data){
            self.connections.forEach(function(conn){
                conn.send(self, data)
            })
        }
        
        return self;
    }
    
};


var Devices = {};
var Presets = {};

Devices.SerialMock = function(opts){
    var device = Synergio.Device({
        name: "SerialMock",
        outputs: [{name: "OUT"}]
    }.merge(opts))

    function cnt(){
        for(var i=0; i<3; i++) device.outputs[0].send("J" + i + "=" + parseInt(Math.random()*100) + "\n")
        setTimeout(cnt, 100)
    }
    cnt()
    
    return device;
}
    
Devices.Serial = function(opts){
    var device = Synergio.Device({
        name: "Serial",
        inputs: [{
            name: "Data",
            fun: function(data){
                console.log(SerialPort)
                SerialPort.send_(data)
            }
        }],
        outputs: [ 
            {name: "Data"}
        ],
    }.merge(opts));
    
    return device;
}

Devices.SendButton = function(opts){
    var device = Synergio.Device({
        name: "Send '" + opts.what + "'",
        outputs: [{name: "Output"}]
    }.merge(opts))
    
    device.button = Synergio.R.rect(device.header.attrs.x+10, device.header.attrs.y+25, 30, 10, 5).attr({fill: "rgb(37, 116, 176)", stroke: "#fff"})
    device.set.push(device.button)
    device.button.click(function(){
        device.outputs[0].send(opts.what)
    })
    
    device.button.hover(function(){
        device.button.attr({fill: "#fff"})
    }, function(){
        device.button.attr({fill: "rgb(37, 116, 176)"})
    })
    
    return device;
}

Devices.Joystick = function(opts){
    var device = Synergio.Device({
        name: "Joystick",
        inputs: [
            {
                name: "Serial Data",
                fun: function(data){
                    var id = parseInt(data[1]);
                    if(this.device.outputs[id]) this.device.outputs[id].send(data.substr(3))
                }
            }
        ],
        outputs: [{name: "X-axis"}, {name: "Y-axis"}, {name: "Z-axis"}]
    }.merge(opts));
    
    return device;
}

Devices.Debug = function(opts){
    var device = Synergio.Device({
        name: "Debug",
        inputs: [
            {
                name: "Input",
                fun: function(data){
                    this.device.label.remove()
                    console.log(this.device.header.attrs)
                    this.device.label = Synergio.R.text(this.device.header.attrs.x + 40, this.device.header.attrs.y + 30, data).attr({fill: "#fff", "stroke-width": 0})
                    this.device.set.push(this.device.label)
                }
            }
        ],
    }.merge(opts))
    
    device.label = {remove: function(){}}
    
    return device;
}

Devices.Log = function(opts){
    var device = Synergio.Device({
        name: "Log",
        inputs: [
            {
                name: "Console", 
                fun: function(data){ 
                    if($("#log div").length > 30){
                        $("#log div").eq(0).remove()
                    }
                    $("#log").append("<div>" + data + "</div>")
                }
            }
        ],
    }.merge(opts))
    
    return device;
}

Devices.Graph = function(opts){
    var device = Synergio.Device({
        name: "Graph",
        inputs: [
            {
                name: "IN", 
                fun: function(data){ 
                    device.graph.addData(data, 0)
                }
            },
            {
                name: "IN", 
                fun: function(data){ 
                    device.graph.addData(data, 1)
                }
            }
        ],
        height: 160,
        width: 300
    }.merge(opts))
    
    device.graph = {
        data: [[],[]],
        path: [{},{}],
        
        height: device.height - 30,
        width: device.width - 25,
        
        _w: (device.width - 25) / 35,
        
        addData: function(data, n){
            if(this.data[n].length >= 35){
                this.data[n].splice(0,1)
            }
            
            if(this.path[n].remove) this.path[n].remove();
            
            this.data[n][this.data[n].length] = parseInt(data);
            // repaint
            path = "M" + [0, device.height]
            for(var i=0; i<this.data[n].length; i++){
                path += "L" + [this._w*i, device.height - (this.data[n][i] * this.height / 100)]
            }
            path += "L" + [this.data[n].length*this._w, device.height]
            
            this.path[n] = Synergio.R.path(path).translate(device.header.attrs.x + 20, device.header.attrs.y-5).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.3})
            device.set.push(this.path[n])
        }
    }
    
    device.set.push(device.graph.bg)

    
    
    return device;
}

Devices.Slider = function(opts){
    var device = Synergio.Device({
        name: "Slider",
        outputs: [{name: "Value"}],
        height: 140
    }.merge(opts))
    
    device.onDragUpdate = function(dragging_over, dx, dy, event){
        device.slider.css("left", device.header.attrs.x+30).css("top" , device.header.attrs.y + 30)
    }
    
    device.slider = $("<input type=range min=0 max=100>").appendTo($("#holder")).change(function(h){
        device.outputs[0].send(this.value)
    })
    device.onDragUpdate()

        
    
    
    return device;
}

Presets.JoystickSerial = function(){
    var counter  = Devices.SerialMock({coords: [20, 120]})
    var log      = Devices.Log({coords: [220, 160]})
    var serial   = Devices.Serial({coords: [120, 40]})
    var sendExcl = Devices.SendButton({what: "!", coords: [20, 40]})
    var joy      = Devices.Joystick({coords: [220, 40]})
    var slider   = Devices.Slider({coords: [20, 180]})

    var axels = [];
    for(var i=0; i<3; i++){
        axels[i] = Devices.Graph({name: "Axis " + i, coords: [320, 180*i + 40]})
        joy.outputs[i].connectWith(axels[i].inputs[0])
    }
    
    sendExcl.outputs[0].connectWith(serial.inputs[0])
    sendExcl.outputs[0].connectWith(log.inputs[0])
    serial.outputs[0].connectWith(joy.inputs[0])
    serial.outputs[0].connectWith(log.inputs[0])
    //counter.outputs[0].connectWith(joy.inputs[0])
    
    processSerialPortInput = function(msg){ serial.outputs[0].send(msg) }
}


var processSerialPortInput = function(msg){ console.log("got: " + msg) };

window.onload = function(){
    Synergio.init();
    Synergio.loadPreset("JoystickSerial")
}
