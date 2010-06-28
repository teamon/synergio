var Socket = Class.create({
	device: null,
	name: '',
	connections: null,
	view: null,
	x: 0,
	y: 0,
	initialize: function(device, name){
		this.connections = [];
		this.device = device;
		
		this.view = new (Class.create({
			owner: this,
			pad: null,
			createPad: function(){
				this.pad = Program.R.circle(this.owner.x, this.owner.y, 4).attr(
					{stroke: "#fff", fill: "#fff", "fill-opacity": 0.0});
				this.pad.hover(
					function(){this.pad.attr({stroke: "#000"});}, 
					function(){this.pad.attr({stroke: "#fff"});}
				);
			},
			initialize: function(){
				this.createPad();								
				this.pad.draggable();
				var mouse, conn;				
				var socket = this;
				this.pad.dragStart = function(x, y, mousedownevent, mousemoveevent){
					mouse = new DraggedSocket(new DumbDevice(), this.view, this.isInput());
					mouse.repaint(x, y);
					
					socket.createPad();
					socket.repaint(this.x, this.y);
					
					conn = socket.connect(mouse);
				};
				
				this.pad.dragUpdate = function(dragging_over, dx, dy, event){
            mouse.redraw(mouse.x + dx,mouse.y + dy);
            conn.repaint();
        };
				
				this.pad.dragFinish = function(dropped_on, x, y, event){
					console.log('drag finish');
					this.owner.disconnect(mouse);
					mouse.remove();
				};
				
			},
			repaint: function(x, y){
				this.pad.attr({x: x, y: y});
			},
			remove: function(){
				this.pad.remove();
			}
		}));
	},
	
	isInput: function(){
		return null;
	},
	
	acceptsTypeOf: function(socket){
		//input is supposed to check if outputs return type is compatible
		//ouptut should return inputs acceptsTypeOf
		return socket.acceptsTypeOf(socket);
	},
	
	canConnect: function(socket){
		return (socket.isInput() == !this.isInput()) && this.acceptsTypeOf(socket);
	},
	
	connect: function(socket){
		if (!this.canConnect(socket)) return null;
		
		this.disconnect(socket);
		var connection = new Connection(this, socket);
		return connection;
	},
	
	disconnect: function(socket){
		var pred = function(conn){
			if (conn.sockets.pos(socket) != -1 && conn.sockets.pos(this) != -1){
				conn.remove();
				return true;
			}else{
				return false;
			}
		};
		socket.connections.remove(pred);
		this.connections.remove(pred);		
	},
	updateConnections: function(){
		this.connections.forEach(function(conn){conn.repaint();});
	},
	repaint: function(x, y){
		this.x = x;
		this.y = y;
		this.view.repaint(x, y);
		this.updateConnections();
	},
	remove: function(){
		this.view.remove();
		//this.connections.forEach(function(conn){conn.remove();});
	}	
});