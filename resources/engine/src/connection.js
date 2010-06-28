var Connection = Class.create({
	sockets: null,
	view: null,
	initialize: function(a, b){
		this.sockets = [a, b];
		this.view = new (Class.create({
			path: null,
			bulletA: null,
			bulletB: null,
			owner: this,
			calculatePathAndBullets: function(){                        
          var bb1 = this.owner.a.view.pad.getBBox();
          var bb2 = this.owner.b.view.pad.getBBox();
  
          var x1 = bb1.x + bb1.width / 2;
          var y1 = bb1.y + bb1.height / 2;
          var x4 = bb2.x + bb2.width / 2;
          var y4 = bb2.y + bb2.height / 2;

          var x2 = x1 + (x4 - x1) / 2;
          var y2 = y1;
          var x3 = x4 + (x1 - x4) / 2;
          var y3 = y4;

          path = ["M", x1, y1, "C", x2, y2, x3, y3, x4, y4].join(",");
          
          return [path, x1, y1, x4, y4];
      },      
			initialize: function(){
				var d = this.calculatePathAndBullets();
				this.path = Program.R.path(d[0]).attr({stroke: "#fff", fill: "none", "stroke-width": 3, "stroke-opacity": 0.5});
				this.bulletA = Program.R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
				this.bulletB = Program.R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});
			},
			remove: function(){
				path.remove();
				bulletA.remove();
				bulletB.remove();
			},
			repaint: function(){
				var d = this.calculatePathAndBullets();
				this.path.attr({path: d[0]});
				this.bulletA.attr({x: d[1], y: d[2]});
				this.bulletB.attr({x: d[3], y: d[4]});
			}
		}));
	},
	
	repaint: function(){
		this.view.repaint();
	},
	
	send: function(from, val){
		var a = 0, b = 1;
		if (from != this.sockets.first()){
			a = 1;
			b = 0;
		}
		a = sockets[a]; b = sockets[b];
		b.device.receiveInput(a, b, val);
	},
	
	remove: function(){
		this.view.remove();
	}
});