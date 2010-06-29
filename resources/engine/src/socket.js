var Socket = Class.create({
	device: null,
	name: '',
	connections: null,
	view: null,
	x: 10,
	y: 10,
	createView: function(){
		this.view = new (Class.create({
			owner: this,
			pad: null,
			initialize: function(){
				this.pad = Program.R.circle(this.owner.x, this.owner.y, 4).attr(
					{stroke: "#fff", fill: "#fff", "fill-opacity": 0.0});
				
				var pad = this.pad;
				this.pad.hover(
					function(){pad.attr({stroke: "#000"});}, 
					function(){pad.attr({stroke: "#fff"});}
				);
				this.pad.draggable();
				
				var mouse, conn;				
				var t = this;
				this.pad.dragStart = function(x, y, mousedownevent, mousemoveevent){
					var view = t;
					
					t.owner.view = null;
					t.owner.createView();					
					t.repaint();
					
					mouse = new DraggedSocket(new DumbDevice(), view);
					view.repaint();

					conn = t.owner.connect(mouse);
					return mouse.view.pad;
				};
				
				this.pad.dragUpdate = function(dragging_over, dx, dy, event){
	      	mouse.repaint(mouse.x + dx,mouse.y + dy);
	      	conn.repaint();
				};
				
				var owner = this.owner;
				this.pad.dragFinish = function(dropped_on, x, y, event){
					mouse.remove();
					var socket = Program.findSocket(x, y);
					if (socket != null && t.owner.canConnect(socket)){
						t.owner.connect(socket);
					}
				};
			},
			repaint: function(){
				this.pad.attr({cx: this.owner.x, cy: this.owner.y});
			},
			remove: function(){
				this.pad.remove();
			}
		}));
	},
	
	initialize: function(device, name){
		this.connections = [];
		this.device = device;
		this.name = name;
		this.createView();
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
		return socket._canConnect(this);
	},
	
	_canConnect: function(socket){
		return (socket.isInput() == !this.isInput()) && this.acceptsTypeOf(socket);
	},
	
	connect: function(socket){
		if (!this.canConnect(socket)) return null;
		
		this.disconnect(socket);
		var connection = new Connection(this, socket);
		this.connections.push(connection);
		socket.connections.push(connection);
		return connection;
	},
	
	disconnect: function(socket){
		var t = this;
		var pred = function(conn){
			if (conn.sockets.pos(isEqualPred(socket)) != -1 && conn.sockets.pos(isEqualPred(t)) != -1){
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
		this.view.repaint();
		
		this.updateConnections();
	},
	remove: function(){
		this.view.remove();
		this.connections.forEach(function(conn){conn.disconnect();});
	}	
});
//= require "devices/DumbDevice"
//= require "sockets/DraggedSocket"
