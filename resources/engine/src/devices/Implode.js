Program.Device.Implode = Class.create(Program.Device.Abstract.Device, {
	currvalues: null,
	initialize: function($super, opts){
		var defaults = {name: 'Implode', inputs: 1, width: 50};
		opts = defaults.merge(opts);
		opts.height = opts.inputs*15 + 20;
		$super(opts);
		
		this.currvalues = [];
		for (var i = 0; i < opts.inputs; i++) this.addInput(new Input(this, 'IN'+(i+1)));
		this._reset();
		
		this.addOutput(new Output(this, 'OUT'));
	},
	_reset: function(){for (var i = 0; i < this.inputs.length; i++) this.currvalues[i] = undefined; },
	onReceiveInput: function(from, to, val){
		var i = this.inputs.pos(to);
		this.currvalues[i] = val;
		var flag = true;
		for (var j = 0; j < this.inputs.length; j++) flag &= this.currvalues[j] != undefined;
		if (flag){
			this.send(0, Object.clone(this.currvalues)); //PROBLEM: wysylanie przez referencje w osobnym watku jest niebezpieczne - obiekt moze sie zmienic przed odczytem!
			this._reset();
		}
	}
});