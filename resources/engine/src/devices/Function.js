Program.Device.Abstract.Function = Class.create(Program.Device.Abstract.Device, {
	fun: null,
	currvalues: null,
	initialize: function($super, opts){
		var defaults = {outputs:1, fun: function(x){return x;}, name:'Function'};
		opts = defaults.merge(opts);
		opts.height = 20 + opts.outputs*15;
		opts.width = 40;
		
		$super(opts);						
		for (var i = 0; i < opts.outputs; i++) this.addOutput(new Output(this, 'OUT'+(i+1)));
		this.addInput(new Input(this, 'IN'));		
		
		this.fun = opts.fun;
	},
	onReceiveInput: function(from, to, val){
		var out = this.fun(val);
		for (var j = 0; j < this.outputs.length; j++) this.send(j, out[j]);
	}
});