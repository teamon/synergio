Program.Device.SimpleDevice = Class.create(Device, {
	initialize: function($super, opts){
		var def = {name: 'Hello World', height:80, width:80, x:10, y:10};
		def.merge(opts);
		$super(def);
		var inp = new Input(this, 'in');
		this.addInput(inp);
		this.addOutput(new Output(this, 'out'));
	},
	receiveInput: function(fromInput, toInput, val){
		this.outputs.forEach(function(socket){socket.send(val); });
	}
});