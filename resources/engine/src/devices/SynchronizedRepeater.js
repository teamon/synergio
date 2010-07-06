//= require <devices/SynchronizedDevice>
Program.Device.SynchronizedRepeater = Class.create(Program.Device.Abstract.SynchronizedDevice,{
	value: undefined,
	initialize: function($super, opts){
		var defaults = {width: 50, height: 55, name: 'Repeater'};
		$super(defaults.merge(opts));
		this.addInput(new Input(this, 'IN'));
		this.addOutput(new Output(this, 'OUT'));
		this.repaint();
	},
	clockTick: function(clock){
		if (this.value != undefined) this.outputs.first().send(this.value);
	},
	onReceiveInput: function($super, from, to, val){
		if ($super(from, to, val)) return true;
		this.value = val;
	}
});