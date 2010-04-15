


// window.onload = function () {

//  
//  

//  
//     var R = Raphael("holder", 640, 480);
//     R.connections = [];
//  
//  var S = {
//      devices: [],
//      isDrag: false,
//      
//      pad: function(x, y, type){
//          var color = type == "IN" ? "#f00" : "#0f0"
//          
//          var p = R.circle(x, y, 5);
//          p.padType = type;
//          p.attr({fill: color, stroke: color, "fill-opacity": 0, "stroke-width": 2})
//          
//          p.connect = function(other){
//              var con = R.connect(this, other);
//              p.connections
//              
//          }
//      }
//      
//  }
//  
//  
//  
//  
//  
//  function Pad(x, y, type){
//      
//      this.circle.mousedown(function(e){
//          console.log(c)
//          var mousePad = Pad(this.circle.attrs.cx, this.circle.attrs.cy, 5).attr({fill: "#fff", stroke: "#fff", "stroke-width": 2})
//          p.connect(c);
//          p.dx = p.clientX;
//          p.dy = p.clientY;
//          p.pad = true
//          p.from = c;
//          isDrag = p;
//          // this.animate({"fill-opacity": .2}, 500);
//          e.preventDefault && e.preventDefault();
//      })
//      
//      this.connect = function(a, b){
//          var c = R.connection(a,b)
//          S.connections.push(c);
//          this.connection = connect(p, c)
//          return c;
//      }
//      
//      return c;
//  };
//  
//  

//  
//  
//  function RandomGenerator(x,y){
//      Device(x,y);
//      this.name = "Random";
//      this.inputs = [];
//      this.outputs = [];
//  }
//  
//  function Graph(x,y){
//      Device(x,y);
//      this.name = "Graph";
//      this.inputs = [
//                     LineIn(function(data){
//                            // some obj-c processing
//                            console.log("got " + data);
//                            }),
//                     LineIn(function(data){
//                            
//                            })
//                     ];
//  }
//  
//  function LineIn(fun){
//      this.send = fun
//  }
//  
//  function LineOut(){
//      this.connections = [];
//      this.send = function(data){
//          connection.forEach(function(con){
//                             con.send(data)
//                             })
//      }
//  }
//  
//  
//  
//     // drag & drop

//     document.onmouseup = function () {
//         if (S.isDrag && S.isDrag.pad){
//             disconnect(S.isDrag.connection)
//          
//          
//             function findPad(drag){
//                 var box = drag.getBBox()
//                 var E = 5
//                 var from = drag.from
//                 for(i=0; i<S.devices.length; i++){
//                     if(S.devices[i] != from.device){
//                         var p = S.devices[i].pads.find(function(p){
//                                                   if(p.padType == from.padType) return false;
//                                                   var b = p.getBBox()
//                                                   console.log(b)
//                                                   return (Math.abs(b.x - box.x) < E && Math.abs(b.y - box.y) < E);
//                                                   })
//                         if(p) return p;
//                     }
//                 }
//                 return null;
//          }
//          
//          if(p = findPad(S.isDrag)){
//              console.log(p)
//              p.connect(S.isDrag.from)
//          }
//          
//          S.isDrag.remove()
//          
//      }
//         // isDrag && isDrag.animate({"fill-opacity": 0}, 500);
//         S.isDrag = false;
//     };
//     
// 
//     function disconnect(con){
//         for(i = 0; i<connections.length; i++){
//             if(connections[i] == con){
//                 connections.splice(i, 1)
//                 con.remove()
//                 return;
//             }
//         }
//     }
//     
//     
// 
//  
//     
//     
//     
//     var d1 = new RandomGenerator(50, 50)
//     var d2 = new Graph(300, 100)
//     S.devices.push(d1)
//  
//  S.devices.push(d2)
//     
//     // connect(d1.pads[1], d2.pads[0])
//     
// };
// 
// 
// 
// 

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

Array.prototype.contains = function(obj){
    for (var i=0; i < this.length; i++) {
        if(this[i] == obj) return true;
    }
    return false;
}


var R = Raphael("holder", 640, 480);

var S = {
    isDrag: false,
    connections: []
}

// drag & drop

document.onmousemove = function (e) {
    e = e || window.event;
    if (S.isDrag) {
        // if(S.isDrag.pad){
            // drag pad
            // S.isDrag.translate(e.clientX - isDrag.dx, e.clientY - isDrag.dy);
        // } else {
            S.isDrag.item.translate(e.clientX - S.isDrag.dx, e.clientY - S.isDrag.dy);
        // }
        
        // refresh connections
        S.connections.forEach(function(con){ con.update() })
        
        R.safari();
        S.isDrag.dx = e.clientX;
        S.isDrag.dy = e.clientY;
    }
};



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
    
    this.line = R.path(d[0]).attr({stroke: "#fff", fill: "none"});
    this.bulletFrom = R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
    this.bulletTo = R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});
    
    this.update = function(){
        var d = this.calculatePathAndBullets();
        this.line.attr({path: d[0]});
        this.bulletFrom.attr({cx: d[1], cy: d[2]});
        this.bulletTo.attr({cx: d[3], cy: d[4]});
    }
    
    this.remove = function(){
        this.line.remove();
        this.bulletFrom.remove();
        this.bulletTo.remove();
    }
}


function Socket(x, y, type){
    var color = type == "INPUT" ? "#f00" : "#0f0"
    this.pad = R.circle(x, y, 5).attr({stroke: color,  "stroke-width": 2})
    
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
}

function Device(opts){
    var self = this;
    this.sockets = {
        input: [],
        output: []
    }
    
    this.set = R.set();
    
    opts.input.forEach(function(socket, i){
        var s = new Socket(opts.x + 10, opts.y + 25 + i * 15, "INPUT")
        self.sockets.input.push(s);
        self.set.push(s.pad);
    })
    
    opts.output.forEach(function(socket, i){
        var s = new Socket(opts.x + 90, opts.y + 25 + i * 15, "OUTPUT")
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
        // this.animate({"fill-opacity": .2}, 500);
        e.preventDefault && e.preventDefault();
    })
    
    this.header.mouseup(function(e){
        S.isDrag = false;
    })
    
}


var a = new Device({
    x: 50,
    y: 50,
    input: [{}, {}],
    output: [{}, {}, {}, {}]
})

var b = new Device({
    x: 100,
    y: 200,
    input: [{}, {}, {}, {}, {}, {}, {}],
    output: [{}, {}, {}, {}]
})

a.sockets.input[0].connect(b.sockets.output[0])

a.sockets.input[1].connect(b.sockets.output[1])
a.sockets.input[1].connect(b.sockets.output[2])
a.sockets.input[1].connect(b.sockets.output[3])




// var a = new Socket(50, 50);
// var b = new Socket(100, 200);

// var con = new SocketConnection(d.sockets.input[0], d.sockets.output[2]);

// =========
// =========
// =========

}












