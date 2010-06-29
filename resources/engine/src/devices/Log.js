Program.Device.Log = Class.create(Device, {
	initialize: function($super, opts){
		var defaults = {x:10, y:10, width:80, height:40, name:'Log'};
		$super(defaults.merge(opts));
		this.addInput(new Input(this, 'Log'));
	},
	receiveInput: function(from, to, val){
		console.log(val);
	}
});