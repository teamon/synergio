//We are using Class, Object, Array, Enumerable and String extensions from Prototype
//= require "prototype"

var Program = { 
	R: null,
	init: function(){
		this.R = Raphael("holder", 640, 480);
	},

	devices: [],
	
	findSocket: function(x, y){
		var socket = null;
		this.devices.forEach(function(device){
			socket = device.socketAt(x, y) || socket;
		});
		return socket;
	}
};

//= require "device"
//= require "connection"
//= require "socket"
//= require "sockets/Input"
//= require "sockets/Output"

var Devices = {};


var Presets = {};

//= require "devices/SimpleDevice"

window.onload = function(){
	Program.init();
	Devices['simple'] = new SimpleDevice('elo');
	Program.devices.push(Devices['simple']);
	Devices['simple'] = new SimpleDevice('lol');
	Program.devices.push(Devices['simple']);
};
