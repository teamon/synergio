Program.Device.SynchronizedDevice = Class.create(Device, {
	clockInput: null,
	initialize: function($super, opts){
		$super(opts);
		this.clockInput = new Input(this, 'CLK');
		this.addInput(this.clockInput);
		
		this.repaint();
	},
	onReceiveInput: function($super, from, to, val){
		if (to == this.clockInput){
			this.clockTick(from.device);
			return true;
		}else
			$super(from, to, val);
	},
	clockTick: function(clock){},
	repaint: function($super){
		this.inputs.shift(); //removes first element
		$super();
		this.inputs.unshift(this.clockInput);
		
		var pos = this._defaultInputBase();
		pos[1] = this.y + this.height - 8;
		this.clockInput.repaint(pos[0], pos[1]);
	}
});