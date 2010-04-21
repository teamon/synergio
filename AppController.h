#import <Cocoa/Cocoa.h>
#import "MainView.h"
#import "Serial.h"

@interface AppController : NSObject {
	IBOutlet MainView *aView;
	Serial *serial;
}

-(BOOL) applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication;

-(Serial *)serial;

@end
