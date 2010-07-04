Program.Components.Slider = function(view, opts){
	var defaults = {x: 10, y: 30, min: 0, max: 100};
	opts = defaults.merge(opts);
	var slider = $("<input type=range min=" + opts.min + " max="+opts.max+">").appendTo($("#holder"));
	view._repaint = view.repaint;
	view.repaint = function(){
		this._repaint();
		slider.css("left", this.owner.x+opts.x).css("top" , this.owner.y + opts.y);
	};
	view.repaint();
	return slider;
};