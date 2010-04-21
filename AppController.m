#import "AppController.h"
#import "MainView.h"


@implementation AppController

- (void)awakeFromNib
{
	serial = [[Serial alloc] openWithDelegate:aView andPath:@"/dev/cu.usbserial-FTSXYJMG"];
		
	[aView setAppController:self];
	[aView loadBundleFile:@"main"];
}

-(BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication
{
	return YES;
}

-(void)windowWillClose:(NSNotification *)notification
{
	[serial closePorts];
	[serial release];
}

-(Serial *)serial
{
	return serial;	
}

@end
