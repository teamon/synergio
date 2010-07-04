Program.Device.Log = Class.create(Device, {
	initialize: function($super, opts){
		var defaults = {x:10, y:10, width:40, height:36, name:'Log'};
		$super(defaults.merge(opts));
		this.addInput(new Input(this, 'Log'));
	},
	onReceiveInput: function(from, to, val){
		console.log(val);
	}
});