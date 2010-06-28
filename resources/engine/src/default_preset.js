
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
