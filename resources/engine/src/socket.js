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
				var t = this;
				
				$(this.pad.node).hover(
					function(event){pad.attr({stroke: "#000"});},
					function(event){pad.attr({stroke: "#fff"});});
				
				$(this.pad.node).dblclick(function(){ t.owner.disconnectAll();});
				this.pad.draggable();
				
				var mouse, conn;				
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
					var x = mouse.x + dx, y = mouse.y + dy;
					var socket = Program.findSocket(x, y);					
					
					if (socket != null){
						if (t.owner.canConnect(socket))
							conn.view.state = 'connection-possible';
						else
							conn.view.state = 'connection-impossible';
					}else{
						conn.view.state = '';
					}
					
	      	mouse.repaint(x, y);
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
		//ouptut should return input.acceptsTypeOf
		return socket.acceptsTypeOf(socket);
	},
	
	canConnect: function(socket){
		return socket._canConnect(this);
	},
	
	_canConnect: function(socket){
		return (socket.isInput() == !this.isInput()) && this.acceptsTypeOf(socket);
	},
	
	//FIXME: po puszczeniu myszki sockety czasem sie nie lacza, mimo ze byl zielony kolor
	hasPoint: function(x, y){
		var b = this.view.pad.getBBox(), E = b.width + 2;
		return (Math.abs(b.x - x) < E && Math.abs(b.y - y) < E);
	},
	
	connect: function(socket){
		if (!this.canConnect(socket)) return null;
		if (this.isInput()) return socket.connect(this);
		this._disconnect(socket);
		var connection = new Connection(this, socket);
		
		this.connections.push(connection);
		socket.connections.push(connection);
		
		connection.repaint();
		return connection;
	},
	
	_disconnect: function(socket){ //use connection.disconnect
		var t = this;
		var pred = function(conn){
			return (conn.sockets.pos(isEqualPred(socket)) != -1 && conn.sockets.pos(isEqualPred(t)) != -1);
		};
		socket.connections.remove(pred);
		this.connections.remove(pred);
	},
	
	disconnectAll: function(){
		while(this.connections.length > 0)
			this.connections[0].disconnect();
	},
	
	onDisconnect: function(conn){this.device.onDisconnect(conn)},
	onConnect: function(conn){this.device.onConnect(conn)},	
	
	repaint: function(x, y){
		this.x = x;
		this.y = y;
		this.view.repaint();
		
		this.connections.forEach(function(conn){conn.repaint();});
	},
	remove: function(){
		this.view.remove();
		this.disconnectAll();
	}	
});
//= require "devices/DumbDevice"
//= require "sockets/DraggedSocket"
