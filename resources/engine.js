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

window.onload = function(){
    
    var Synergio = {
        R: Raphael("holder", 640, 480),
        devices: [],
    }
        
    var width = 80;

    Synergio.addDevice = function(opts){
        var device = {
            name: opts.name,
            inputs: [],
            outputs: [],
            set: Synergio.R.set()
        }
    
        if(opts.inputs){
            opts.inputs.forEach(function(e, i){
                var sock = new Socket(device, e.name, "INPUT", e.fun)
                device.inputs.push(sock)
                device.set.push(sock.pad)
                sock.pad.translate(10, 30+i*15)
            })
        }
    
        if(opts.outputs){
            opts.outputs.forEach(function(e, i){
                var sock = new Socket(device, e.name, "OUTPUT", e.fun)
                device.outputs.push(sock)
                device.set.push(sock.pad)
                sock.pad.translate(width-10, 30+i*15)
            })
        }
    
        var height = 25 + Math.max(device.inputs.length, device.outputs.length)*15
    
        device.border = Synergio.R.rect(0, 0, width, height, 5).attr({stroke: "#fff"})
        device.header = Synergio.R.rect(0, 0, width, 20, 5).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.3})
        device.name   = Synergio.R.text(width/2, 10, device.name).attr({"stroke-width": 0, fill: "#fff", "font-family": "Lucida Grande", "font-size": "11pt", "font-style": "normal"})
        device.set.push(device.border, device.header, device.name)
    
        function makeDraggable(obj){
            obj.draggable()
            obj.dragUpdate = function(dragging_over, dx, dy, event){
                device.set.translate(dx, dy)
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
    }
    
    function SocketConnection(obj1, obj2){
        var self = this;
        this.obj1 = obj1;
        this.obj2 = obj2;

        // Return [path, x1, y1, x4, y4]
        this.calculatePathAndBullets = function(){                        
            var bb1 = this.obj1.pad.getBBox();
            var bb2 = this.obj2.pad.getBBox();
    
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

        var d = this.calculatePathAndBullets();
        this.path = d[0];    
        this.line = Synergio.R.path(d[0]).attr({stroke: "#fff", fill: "none", "stroke-width": 3});
        this.bullet1 = Synergio.R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
        this.bullet2 = Synergio.R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});

        var self = this;
        this.line.dblclick(function(){
            self.obj1.disconnectFrom(self.obj2)
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
            this.bullet1.attr({cx: d[1], cy: d[2]});
            this.bullet2.attr({cx: d[3], cy: d[4]});
        }

        this.remove = function(){
            this.line.remove();
            this.bullet2.remove();
            this.bullet1.remove();
        }
        
        this.send = function(from, data){
            if(this.obj1 == from && this.obj2.type == "INPUT") this.doSend(this.obj2, data)
            else if(this.obj2 == from && this.obj1.type == "INPUT") this.doSend(this.obj1, data)
        }
        
        this.doSend = function(to, data){
            to.fun(data)
            this.line.attr({stroke: "#f00"})
            setTimeout(function(){
                self.line.attr({stroke: "#fff"})
            }, 100)
        }
    }
    
    function Socket(device, name, type, fun){
        var self = this;
        this.device = device;
        this.name = name;
        this.type = type;
        this.fun = fun;

        
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
                    m = new Socket("mouse", "mouse")
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
        
        this.pad = createPad();
        
        this.connections = [];
        this.connectWith = function(that){
            var conn = new SocketConnection(this, that)
            this.connections.push(conn)
            that.connections.push(conn)
        }
        
        this.disconnectFrom = function(that){
            var pred = function(conn){
                if((conn.obj1 == self && conn.obj2 == that) || (conn.obj1 == that && conn.obj2 == self)){
                    conn.remove(); 
                    return true;
                } else {
                    return false;
                }
            }
            this.connections.remove(pred)
            that.connections.remove(pred)
        }
        
        this.updateConnections = function(){
            this.connections.forEach(function(conn){ conn.update() })
        }
        
        
        this.send = function(data){
            self.connections.forEach(function(conn){
                conn.send(self, data)
            })
        }
    }

    
    var counter = Synergio.addDevice({
        name: "Counter",
        inputs: [
            ["DEBUG"],
            ["ONE"],
            ["THREE"]
        ],
        outputs: [
            ["1"],
            ["2"],
            ["3"]
        ],
        coords: [50, 50]
    })
    
    function cnt(i, x, delay){
        counter.outputs[i].send(x)
        setTimeout(function(){ cnt(i, x+1, delay) }, delay)
    }
    cnt(0, 1, 1000)
    cnt(1, 1, 1500)
    cnt(2, 1, 200)
    
    var proxy = Synergio.addDevice({
        name: "Proxy",
        inputs: [
            {name: "DEBUG", fun: function(data){ this.device.outputs[0].send(data) } },
            {name: "DEBUG", fun: function(data){ this.device.outputs[1].send(data) } },
            {name: "DEBUG", fun: function(data){ this.device.outputs[2].send(data) } },
            {name: "DEBUG", fun: function(data){ this.device.outputs[3].send(data) } }
        ],
        outputs: [
            {name: "1"},
            {name: "2"},
            {name: "3"},
            {name: "4"}
        ],
        coords: [150, 50]
    })
    
    var log = Synergio.addDevice({
        name: "Log",
        inputs: [
            {name: "Console", fun: function(data){ console.log(data) } }
        ],
        coords: [250, 50]
    })
    
    counter.outputs[0].connectWith(proxy.inputs[0])
    counter.outputs[1].connectWith(proxy.inputs[1])
    counter.outputs[2].connectWith(proxy.inputs[3])
    proxy.outputs[0].connectWith(log.inputs[0])
    proxy.outputs[1].connectWith(log.inputs[0])
    proxy.outputs[2].connectWith(log.inputs[0])
    proxy.outputs[3].connectWith(log.inputs[0])
    
}
