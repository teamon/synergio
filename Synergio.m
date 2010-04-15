#import "Synergio.h"


@implementation Synergio

+(BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector { return NO; }

+(BOOL)isKeyExcludedFromWebScript:(const char *)name { return NO; }

-(void)myMethod
{
	NSLog(@"myMethod called from JavaScript");
}

@end
