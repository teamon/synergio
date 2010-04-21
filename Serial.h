//
//  Serial.h
//  synergio
//
//  Created by Tymon Tobolski on 10-04-21.
//  Copyright 2010 Politechnika Wrocławska. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "AmSerialPort.h"


@interface Serial : NSObject {
	AMSerialPort *serialPort;
	NSMutableString *inputBuffer;
	id delegate;
}

-(Serial *)openWithDelegate:(id)theDelegate andPath:(NSString *)path;

-(void)close;

-(void)serialPortReadData:(NSDictionary *)dataDictionary;

-(void)send:(NSString *)msg;

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector;

+ (BOOL)isKeyExcludedFromWebScript:(const char *)name;

@end
