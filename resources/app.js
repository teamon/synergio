(function($){

$.fn.extend({

	/**
	 * Stores the original version of offset(), so that we don't lose it
	 */
	_offset : $.fn.offset,

	/**
	 * Set or get the specific left and top position of the matched
	 * elements, relative the the browser window by calling setXY
	 * @param {Object} newOffset
	 */
	offset : function(newOffset){
	    return !newOffset ? this._offset() : this.each(function(){
			var el = this;

			var hide = false;

			if($(el).css('display')=='none'){
				hide = true;
				$(el).show();
			};

			var style_pos = $(el).css('position');

			// default to relative
			if (style_pos == 'static') {
				$(el).css('position','relative');
				style_pos = 'relative';
			};

			var offset = $(el).offset();

			if (offset){
				var delta = {
					left : parseInt($(el).css('left'), 10),
					top: parseInt($(el).css('top'), 10)
				};

				// in case of 'auto'
				if (isNaN(delta.left))
					delta.left = (style_pos == 'relative') ? 0 : el.offsetLeft;
				if (isNaN(delta.top))
					delta.top = (style_pos == 'relative') ? 0 : el.offsetTop;

				if (newOffset.left || newOffset.left===0)
					$(el).css('left',newOffset.left - offset.left + delta.left + 'px');

				if (newOffset.top || newOffset.top===0)
					$(el).css('top',newOffset.top - offset.top + delta.top + 'px');
			};
			if(hide) $(el).hide();
		});
	}

});

})(jQuery);

Array.prototype.remove = function(fun){
    for (var i=0; i < this.length; i++) {
        if(fun(this[i])) this.splice(i, 1);
    }
    return this;
}

$(document).ready(function(){
    var Holder = $("#jq_holder")
    
    // init raphael
    var R = Raphael("holder", 640, 480);
    
    function SocketConnection(obj1, obj2){
        this.obj1 = obj1;
        this.obj2 = obj2;

        // Return [path, x1, y1, x4, y4]
        this.calculatePathAndBullets = function(){                        
            var x1 = this.obj1.gui.offset().left + 1 + this.obj1.gui.width() / 2
            var y1 = this.obj1.gui.offset().top  + 1 + this.obj1.gui.height() / 2
            var x4 = this.obj2.gui.offset().left + 1 + this.obj2.gui.width() / 2
            var y4 = this.obj2.gui.offset().top  + 1 + this.obj2.gui.height() / 2

            var x2 = x1 + (x4 - x1) / 2
            var y2 = y1
            var x3 = x4 + (x1 - x4) / 2
            var y3 = y4

            path = ["M", x1, y1, "C", x2, y2, x3, y3, x4, y4].join(",");
            
            return [path, x1, y1, x4, y4];
        }

        var d = this.calculatePathAndBullets();
        this.path = d[0];    
        this.line = R.path(d[0]).attr({stroke: "#fff", fill: "none", "stroke-width": 3});
        this.bullet1 = R.circle(d[1], d[2], 2).attr({fill: "#fff", stroke: "none"});
        this.bullet2 = R.circle(d[3], d[4], 2).attr({fill: "#fff", stroke: "none"});

        var self = this;
        this.line.dblclick(function(){
            self.obj1.disconnectFrom(self.obj2)
            self.remove();
        })

        this.line.hover(function(){
            this.attr({stroke:"#ff0"});
        }, function(){
            this.attr({stroke:"#fff"})
        })

        this.update = function(){
            var d = this.calculatePathAndBullets();
            this.line.attr({path: d[0]});
            this.bullet1.attr({cx: d[1], cy: d[2]});
            this.bullet2.attr({cx: d[3], cy: d[4]});
        }

        this.remove = function(){
            this.line.remove();
            this.bullet2.remove();
            this.bullet1.remove();
        }
    }
    
    function Socket(name, type, fun){
        var self = this;
        this.name = name;
        this.type = type;
        this.fun = fun;
        this.gui = $('<div class="socket socket-' + this.type + '"></div>');
        this.gui.hover(function(){
            self.gui.addClass("socket-hover")
        }, function(){
            self.gui.removeClass("socket-hover")
        })
        if(this.type != 'connect'){
            this.gui.click(function(event){
                var c = new Socket("connect", "connect")
                //c.gui.css("left", self.gui.offset().left).css("top", self.gui.offset().top)
                c.gui.draggable({
                    drag: function(event, ui){
                        self.updateConnections()
                    },
                    stop: function(event, ui){
                        self.disconnectFrom(c);
                        c.gui.remove();
                    }
                })
                console.log(self.gui.offset())
                c.gui.offset({left: self.gui.offset().left, top: self.gui.offset().top})
                Holder.append(c.gui);
                self.connectWith(c)
            })
        }
        
        this.connections = [];
        this.connectWith = function(that){
            var conn = new SocketConnection(this, that)
            this.connections.push(conn)
            that.connections.push(conn)
        }
        
        this.disconnectFrom = function(that){
            var pred = function(conn){
                if((conn.obj1 == self && conn.obj2 == that) || (conn.obj1 == that && conn.obj2 == self)){
                    conn.remove(); 
                    return true;
                } else {
                    return false;
                }
            }
            this.connections.remove(pred)
            that.connections.remove(pred)
        }
        
        this.updateConnections = function(){
            this.connections.forEach(function(conn){ conn.update() })
        }
    }
    
    
    function Device(opts){
        var self = this;
        
        this.name = opts.name;
        this.inputs = opts.inputs;
        this.outputs = opts.outputs;

        this.gui = $('<div class="device">' +
            '<div class="header">' + opts.name + '</div>' +
            '<div class="sockets">' +
                '<div class="inputs"></div>' + 
                '<div class="outputs"></div>' +
            '</div>' +
            '</div>');

        var ip = this.gui.find("div.inputs")
        this.inputs.forEach(function(socket, i){
            ip.append(socket.gui);
        })

        var op = this.gui.find("div.outputs")
        this.outputs.forEach(function(socket, i){
            op.append(socket.gui);
        })
        
        this.gui.draggable({
            handle: ".header",
            snap: true,
            grid: [20, 20],
            drag: function(event, ui){
                self.inputs.forEach( function(socket){ socket.updateConnections() })
                self.outputs.forEach(function(socket){ socket.updateConnections() })
            },
        });
                
        Holder.append(this.gui);
    }
    
    var a = new Device({
        name: "Test A",
        inputs: [
            new Socket("DEBUG"),
            new Socket("ONE"),
            new Socket("THREE")
        ],
        outputs: [
            new Socket("1"),
            new Socket("2"),
            new Socket("3")
        ]
    })
    
    var b = new Device({
        name: "Test B",
        inputs: [
            new Socket("DEBUG", function(data){
                    console.log(data)
            })
        ],
        outputs: [
            new Socket("1"),
            new Socket("2"),
            new Socket("3")
        ]
    })
    
    a.gui.attr("top", 10 + "px")
    
    a.inputs[0].connectWith(b.outputs[0])
    a.inputs[0].connectWith(b.outputs[2])
    
    var x = R.rect(200, 200, 100, 100).attr("fill", "#fff")
    x.style = {}
    $(x).draggable()
    
    
    $("div").disableSelection();
})