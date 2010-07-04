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

var processSerialPortInput = function(msg){ console.log("got: " + msg) };
