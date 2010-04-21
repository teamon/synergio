![synergio](http://grab.by/3UAV "synergio")


# Documentation

## Creating devices

    Devices.MyDevice = function(opts){
      // create device object
      var device = Synergio.Device({
        name: "My Device"
      }.merge(opts));
      
      // customize object
      // ...   
      
      return device; // remember to return
    }
 
    var myItem = Devices.MyDevice({coords: [50, 50]});
    
## Creating presets

    Presets.MyPreset = function(){
        var obj1  = Devices.MyDevice1({coords: [50, 50]})
        var obj2  = Devices.MyDevice2({coords: [150, 50]})

        obj1.outputs[0].connectWith(obj2.inputs[0])
        obj1.outputs[1].connectWith(obj2.inputs[1])
    }