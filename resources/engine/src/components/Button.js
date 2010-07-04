Program.Components.Button = function(view, opts){
	defaults = {x: 0, y: 0, text: ''};
	opts = defaults.merge(opts);
	
	var btn = Program.R.rect(opts.x+10, opts.y+25, 30, 10, 5).attr({fill: "rgb(37, 116, 176)", stroke: "#fff"})
	view.set.push(btn);
	$(btn.node).hover(function(){
		btn.attr({fill: "#ddd"});
	}, function(){
		btn.attr({fill: "rgb(37, 116, 176)"});
	});
	
	$(btn.node).mousedown(function(){
		btn.attr({fill: "#fff"});
	});
	
	$(btn.node).mouseup(function(){
		btn.attr({fill: "#ddd"});
	});
	return btn;
};