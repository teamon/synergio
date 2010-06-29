var DraggedSocket = Class.create(Socket, {
	initialize: function($super, device, view){	
		this.x = view.pad.attrs.cx;
		this.y = view.pad.attrs.cy;
		$super(device, '');
		this.view.remove();
		this.view.pad = view.pad;
		this.view.pad.hover(Prototype.empty, Prototype.empty);
	},
	_canConnect: function(socket){
		return true;
	}
});