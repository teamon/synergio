var DumbDevice = Class.create(Program.Device.Abstract.Device, {
	initialize: function(){
		this.inputs = []; this.outputs = [];
	},
	repaint: function(){}
});