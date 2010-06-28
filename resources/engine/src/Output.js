var Output = Class.create(Socket, {
	isInput: function(){return false;},
	send: function(val){
		this.connections.forEach(function(conn){conn.send(this, val);});
	}
});