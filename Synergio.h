#import <Cocoa/Cocoa.h>


@interface Synergio : NSObject {

}

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector;
+ (BOOL)isKeyExcludedFromWebScript:(const char *)name;
- (void)myMethod;

@end
