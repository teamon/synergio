//= require <components/button>
Program.Device.Clock = Class.create(Program.Device.Abstract.Device, {
	freq: 0,
	enabled: false,
	value: 1,
	removed: false,
	
	freqToMs: function(){ return 1/this.freq*1000; },
	createAnimationPath: function(){
		this.view.clockpath.remove();
		var count = ~~(this.width/20) + 1;			
		var path = "M " + [this.x + 5, this.y+35].join(' ');
		var rep = "l 10 0 l 0 -10 l 10 0 l 0 10";
		for (var i = 0; i < count; i++) path += rep;
		this.view.clockpath = Program.R.path(path).attr({stroke: "#fff", fill: "none", 
														"stroke-width": 1, "stroke-opacity": 1,
														"clip-rect": [this.x + 5,this.y+25, ~~((this.width - 20)/20)*20, 11].join(',')});
	},
	//TODO: optymalizacja animacji (animacja z jquery albo konwersja do gifa?) - atm zzera 40% proca
	startPathAnimation: function(){
		var path = this.view.clockpath, t = this;
		var callback = function(){
			setTimeout(function(){
				t.createAnimationPath();
				if (t.enabled) t.view.clockpath.animate({translation:[-20,0].join(',')}, Math.max(t.freqToMs()*2, 100), callback);
			},1);
		};
		callback();
	},
	
	initialize: function($super, opts){
		var defaults = {width: 60, height: 60, name: 'Clock', freq: 5};
		$super(defaults.merge(opts));
		this.freq = defaults.freq || 1; // frequency cannot be 0
		
		var t = this;
		this.addOutput(new Output(this, 'OUT'));
		
		this.view.button = Program.C.Button(this.view, {y: this.y + this.height - 43, x: this.x + 5});
		
		$(this.view.button.node).click(function(){
			t.enabled = !t.enabled;
			if (t.enabled)
				t.startPathAnimation();			
		});
		
		var f = function(){ 
			if (t.removed) return;
			if (t.enabled){ 
				t.outputs.first().send(t.value);
			}
			setTimeout(f,t.freqToMs());
		};
		f();
		
		this.view.clockpath = {remove: function(){}};
		
		this.view._repaint = this.view.repaint;
		this.view.repaint = function(){
			this._repaint()
			t.startPathAnimation();		
		};
		this.createAnimationPath();
	},
	remove: function($super){
		$super();
		this.removed = true;
	}
});