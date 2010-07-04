//= require <devices/SynchronizedDevice>
//= require <components/Button>
Program.Device.MomentarySwitch = Class.create(Program.Device.SynchronizedDevice,{
	switched: false,
	value: [0, 1],
	initialize: function($super, opts){
		var defaults = {width: 70, height: 50, name: 'Momentary'};
		$super(defaults.merge(opts));
		
		this.addOutput(new Output(this, 'Out'));

		this.view.button = Program.C.Button(this.view, {x: this.x + 10, y: this.y});
		var t = this;
		
		this.view.button.mousedown(function(){
			t.switched = true;
		});
		
		this.view.button.mouseup(function(){
			t.switched = false;
		});
	},
	clockTick: function(clock){
		this.outputs.first().send(this.value[+this.switched]);
	}
});