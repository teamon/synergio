var Output = Class.create(Socket, {
	isInput: function(){return false;},
	send: function(val){
		var t = this;
		this.connections.forEach(function(conn){conn.send(t, val);});
	}
});