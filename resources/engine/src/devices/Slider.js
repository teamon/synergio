//= require <components/Slider>
Program.Device.Slider = Class.create(Device, {
	initialize: function($super, opts){
		var defaults = {name: 'Slider', width: 40, height: 140, max: 100, min: 0};
		opts = defaults.merge(opts);
		$super(opts);
		this.addOutput(new Output(this, 'OUT'));
		
		var device = this;
		this.view.slider = Program.C.Slider(this.view, {max: opts.max, min: opts.min});
		this.view.slider.change(function(h){
      device.outputs.first().send(this.value);
  	});		
	}
});