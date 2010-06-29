var SimpleDevice = Class.create(Device, {
	initialize: function($super, name){
		$super(name, 80, 80, 10, 10);
		var inp = new Input(this, 'in');
		this.addInput(inp);
		this.addOutput(new Output(this, 'out'));
	},
	receiveInput: function(fromInput, toInput, val){
		this.outputs.forEach(function(socket){socket.send(val); });
	}
});