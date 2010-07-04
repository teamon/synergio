//= require <devices/SynchronizedDevice>
//TODO: obsulga zakresu zwracanych liczb
Program.Device.RandomGenerator = Class.create(Program.Device.SynchronizedDevice,{
	initialize: function($super, opts){
		var defaults = {name: 'Random', width: 50, height: 40, min:0, max: 100};
		opts = defaults.merge(opts);
		$super(opts);
		
		this.addOutput(new Output(this, 'OUT'));
	},
	clockTick: function(clock){
		this.outputs.first().send(parseInt(Math.random()*100));
	}
});