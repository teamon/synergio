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
				this.border.draggable();
				this.label.draggable();
				this.border.dragUpdate = this.label.dragUpdate = this.owner.onDrag;
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
	},
	getSocketPos: function(pos, i){
		return [pos[0], pos[1] + 15*i];
	}, 
	repaint: function(){
		this.view.repaint();
		
		var nextSocketPos = function(pos){
			return this.getSocketPos(pos, 1);
		};
				
		var pos = [this.x + 5, this.y + 25];
		this.inputs.forEach(function(socket){socket.repaint(pos[0], pos[1]); pos = nextSocketPos(pos);});
		
		pos = [this.x + this.width - 5, this.y + 25];
		this.inputs.forEach(function(socket){socket.repaint(pos[0], pos[1]); pos = nextSocketPos(pos);});
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
	},	
	addOutput: function(socket){
		this.outputs.push(socket);
	}
});