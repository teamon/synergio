var DraggedSocket = Class.create(Socket, {
	isInp: false,
	initialize: function(device, view, isInput){
		this.connections = [];
		this.view = view;
		this.device = device;
	},
	isInput: function(){return !this.isInp;},
	acceptsTypeOf: function(){return true;}
});