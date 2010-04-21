//
//  Serial.m
//  synergio
//
//  Created by Tymon Tobolski on 10-04-21.
//  Copyright 2010 Politechnika Wrocławska. All rights reserved.
//

#import "Serial.h"
#import "AmSerialPort.h"
#import "AMSerialPortList.h"


@implementation Serial

-(Serial *)openWithDelegate:(id)theDelegate andPath:(NSString *)path
{
	self = [super init];
	
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(didAddPorts:)
												 name:AMSerialPortListDidAddPortsNotification
											   object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self
											 selector:@selector(didRemovePorts:)
												 name:AMSerialPortListDidRemovePortsNotification
											   object:nil];
	
	//[AMSerialPortList sharedPortList];
	
	// instance variables init
	delegate = theDelegate;
	inputBuffer = [[NSMutableString alloc] init];
	
	// init port
	serialPort = [[[AMSerialPort alloc] init:path
									withName:path
										type:(NSString *)CFSTR(kIOSerialBSDModemType)] autorelease];
	[serialPort setDelegate:self];
	[serialPort setSpeed:B9600];
	
	// open port
	if([serialPort open]){
		NSLog(@"port opened");
		[serialPort readDataInBackground];
	}
	
	return self;
}

-(void)send:(NSString *)msg
{
	NSError *error;
	[serialPort writeString:msg usingEncoding:NSASCIIStringEncoding error:&error];
}

-(void)close
{
	[serialPort stopReadInBackground];
	[serialPort clearError];
	[serialPort close];
}

-(void)serialPortReadData:(NSDictionary *)dataDictionary
{
	AMSerialPort *port = [dataDictionary objectForKey:@"serialPort"];
	NSData *data = [dataDictionary objectForKey:@"data"];
	
	if([data length] > 0){
		NSString *text = [[NSString alloc] initWithData:data
											   encoding:NSASCIIStringEncoding];
	
		for(int i=0; i < [text length]; i++){
			NSString *s = [text substringWithRange:NSMakeRange(i,1)];
			if([s isEqualToString:@"\n"]){
				[delegate processInput:inputBuffer];
				[inputBuffer release];
				inputBuffer = [[NSMutableString alloc] init];
			} else {
				[inputBuffer appendString:s];
			}
		}
		
		[text release];
		
		[port readDataInBackground];
	}
}

+(BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector { return NO; }

+(BOOL)isKeyExcludedFromWebScript:(const char *)name { return NO; }



@end
