var Input = Class.create(Socket, {
	isInput: function(){return true;},
	acceptsTypeOf: function(socket){ return true;}
});