//We're using Class, Object, Array, Enumerable and String extensions from Prototype
//= require <prototype>

var Program = { 
	R: null,
	init: function(){
		this.R = Raphael("holder", 640, 480);
		this.D = this.Device;
		this.C = this.Components;
	},
	
	textDefaults: {"stroke-width": 0, fill: "#fff", "font-family": "Lucida Grande", "font-size": "11pt", "font-style": "normal"},
		
	Device: {},
	Components: {},
	devices: [],
	
	findSocket: function(x, y){
		var socket = null;
		this.devices.forEach(function(device){
			socket = device.socketAt(x, y) || socket;
		});
		return socket;
	},
	
	addDevice: function(device){
		this.devices.push(device);
	}
};

//= require <device>
//= require <connection>
//= require <socket>
//= require <sockets/Input>
//= require <sockets/Output>

var Devices = {};


var Presets = {};

//= require <devices/SimpleDevice>
//= require <devices/Log>
//= require <devices/button>
//= require <devices/MomentarySwitch>
//= require <devices/Clock>
//= require <devices/Slider>
//= require <devices/SynchronizedRepeater>
//= require <devices/RandomGenerator>
//= require <devices/Graph>
window.onload = function(){
	Program.init();

	Program.addDevice(new Program.D.SimpleDevice({name: 'elo'}));
	Program.addDevice(new Program.D.SimpleDevice({name: 'lol', x:100, y:200}));
	Program.addDevice(new Program.D.Log({x:100, y:100}));
	Program.addDevice(new Program.D.Button({x:10, y: 100}));
	Program.addDevice(new Program.D.MomentarySwitch({x:200, y: 200}));
	Program.addDevice(new Program.D.Clock({x: 10, y: 300, freq: 5}));
	Program.addDevice(new Program.D.Slider({x: 300, y: 10}));	
	Program.addDevice(new Program.D.SynchronizedRepeater({x: 200, y: 300}));	
	Program.addDevice(new Program.D.RandomGenerator({x:100, y:300}));
	Program.addDevice(new Program.D.Graph({x:330, y:300}));
};
