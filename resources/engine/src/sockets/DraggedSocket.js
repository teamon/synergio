var DraggedSocket = Class.create(Socket, {
	initialize: function($super, device, view){	
		this.x = view.pad.attrs.cx;
		this.y = view.pad.attrs.cy;
		$super(device, '');
		this.view.remove();
		this.view.pad = view.pad;
		this.view.pad.attr({stroke:"#fff"});
		$(this.view.pad.node).unbind('hover');		
	},
	_canConnect: function(socket){
		return true;
	},
	isInput: function(){return false;}
	
});