//
//  Serial.m
//  synergio
//
//  Created by Tymon Tobolski on 10-04-21.
//  Copyright 2010 Politechnika Wrocławska. All rights reserved.
//

#import "Serial.h"
#import "AmSerialPort.h"


@implementation Serial

-(Serial *)init
{
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(didAddPorts:)
												 name:AMSerialPortListDidAddPortsNotification
											   object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(didRemovePorts:)
												 name:AMSerialPortListDidRemovePortsNotification
											   object:nil];
	
	[AMSerialPortList sharedPortList];
}

@end
