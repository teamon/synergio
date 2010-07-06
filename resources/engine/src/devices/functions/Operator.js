//= require <devices/Function>
Program.Device.Operator = Class.create(Program.Device.Abstract.Function, {
	initialize: function($super, opts, operator){
		var defaults = {name: operator};
		opts = defaults.merge(opts);
		var cmd = '[parseInt(x[0]' + operator + 'x[1])]';
		opts.fun = function (x){return eval(cmd);};
		$super(opts);		
	}
});
