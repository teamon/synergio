Array.prototype.remove = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) this.splice(i, 1);
    }
    return this;
}

Array.prototype.find = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) return this[i];
    }
    return null;
}
