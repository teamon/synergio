var Device = Class.create({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	
	view: null,	
	inputs: null,
	outputs: null,
	name: '',
	
	initialize: function(name, width, height, x, y){
		this.name = name;
		this.width = width || Program.width;
		this.height = height || Program.height;
		this.x = x;	this.y = y;
		this.inputs = [];	this.outputs = [];
		
		this.view = new (Class.create({
			border: Program.R.rect(0, 0, width, height, 5).attr({stroke: "#fff"}),
			header: Program.R.rect(0, 0, width, 20, 5).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.3}),
			label: Program.R.text(width/2, 10, name).attr({"stroke-width": 0, fill: "#fff", "font-family": "Lucida Grande", "font-size": "11pt", "font-style": "normal"}),
			owner: this,
			initialize: function(){
				this.header.draggable();
				this.label.draggable();
				
				var owner = this.owner;
				this.header.dragUpdate = this.label.dragUpdate = function(dragging_over, dx, dy, event){return owner.onDrag(dragging_over, dx, dy, event);};
			},
			repaint: function(){
				this.border.attr({x: this.owner.x, y: this.owner.y, 
					width: this.owner.width, height: this.owner.height});
				this.header.attr({x: this.owner.x, y: this.owner.y, 
					width: this.owner.width});
				this.label.attr({x: this.owner.width/2 + this.owner.x, y: this.owner.y + 10, 
					text: this.owner.name});		
			}			
		}));
		this.view.repaint();
	},
	getSocketPos: function(pos, i){
		return [pos[0], pos[1] + 15*i];
	}, 
	
	defaultInputBase: function(){return [this.x + 8, this.y + 28];},
	defaultOutputBase: function(){return [this.x + this.width - 8, this.y + 28];},
	
	repaint: function(){
		this.view.repaint();
		
		var dev = this;
		var nextSocketPos = function(pos){
			return dev.getSocketPos(pos, 1);
		};
				
		var pos = this.defaultInputBase();
		this.inputs.forEach(function(socket){socket.repaint(pos[0], pos[1]); pos = nextSocketPos(pos);});
		
		pos = this.defaultOutputBase();
		this.outputs.forEach(function(socket){socket.repaint(pos[0], pos[1]); pos = nextSocketPos(pos);});
	},
	translate: function(dx, dy){
		this.x += dx; this.y += dy;
		this.repaint();
	},
	onDrag: function(dragging_over, dx, dy, event){
		this.translate(dx, dy);
	},
	receiveInput: function(fromInput, toInput, val){},
	addInput: function(socket){
		this.inputs.push(socket);
		var pos = this.getSocketPos(this.defaultInputBase(), this.inputs.length-1);
		socket.repaint(pos[0], pos[1]);
	},	
	addOutput: function(socket){
		this.outputs.push(socket);
		var pos = this.getSocketPos(this.defaultOutputBase(), this.outputs.length-1);
		socket.repaint(pos[0], pos[1]);
		
	},
	socketOfAt: function(sockets, x, y){
		return sockets.find(function(socket){
			var b = socket.view.pad.getBBox(), E = b.width;
			return (Math.abs(b.x - x) < E && Math.abs(b.y - y) < E);
		});
	},
	socketAt: function(x, y){
		return this.socketOfAt(this.inputs, x, y) || this.socketOfAt(this.outputs, x, y);
	}
});