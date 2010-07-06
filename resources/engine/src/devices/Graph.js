Program.Device.Graph = Class.create(Program.Device.Abstract.Device,{
	data: [],
	maxLength: 35,
	maxValue: 100,
	initialize: function($super, opts){
		var defaults = {width:300, height: 160, name: 'Graph'};
		$super(defaults.merge(opts));
		
		this.view.graph = [];
		this.addInput(new Input(this, 'IN'));
		this.addInput(new Input(this, 'IN'));
	},
	addInput: function($super, input){
		$super(input);

		this.data.push([]);
		this.view.graph.push({remove:function(){}, translate: function(x,y){}});
	},
	onReceiveInput: function(from, to, val){
		var height = this.height - 40;
		var width = this.width - 35;		
		var val = parseInt(val);
		var i = this.inputs.pos(to);

		if (this.data[i].length >= this.maxLength) this.data[i].shift();
		this.data[i][this.data[i].length] = val;
		
		var step = (width/((this.data[i].length - 1) || 0));
				
		this.view.graph[i].remove();
		// this.view.set.remove(this.view.graph[i]);
		
		var left = this.x + 20;
		var top = this.y + 30;

		var path = 'M' + [0, height];
		for (var j = 0; j < this.data[i].length; j++){
			path += 'L' + [j*step, height - parseInt(this.data[i][j]/this.maxValue*height)];
		}		
		if (this.data[i].length == 1){
			path += 'L' + [step, height - parseInt(this.data[i][0]/this.maxValue*height)];
		}
		path += 'L' + [width, height];		
		
		this.view.graph[i] = Program.R.path(path).attr({stroke: "#fff", fill: "#fff", "fill-opacity": 0.3,  
														"stroke-width": 2, "stroke-opacity": 1}).translate(left, top);
		this.view.set.push(this.view.graph[i]);
	}
})