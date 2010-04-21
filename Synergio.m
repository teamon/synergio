#import "Synergio.h"


@implementation Synergio

+(BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector { return NO; }

+(BOOL)isKeyExcludedFromWebScript:(const char *)name { return NO; }

-(void)log:(NSString *)data
{
	NSLog(@"%s", data);
}

@end
