//= require <components/Button>
Program.Device.Button = Class.create(Program.Device.Abstract.Device, {
	value: 1,
	initialize: function($super, opts){
		var defaults = {name: 'Button', width: 60, height: 40};
		$super(defaults.merge(opts));
		this.addOutput(new Output(this, 'Out'));

		this.view.button = Program.C.Button(this.view, {x: this.x, y: this.y});
		var t = this;
		$(this.view.button.node).click(function(){
			t.send(0, t.value);
		});
	}
});