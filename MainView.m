#import "MainView.h"
#import "Synergio.h"

@implementation MainView

- (id)initWithFrame:(NSRect)frame 
{
	self = [super initWithFrame:frame
					  frameName:nil
					  groupName:nil];
	
	[self setPolicyDelegate:self];
	[self setFrameLoadDelegate:self];
	
	return self;
}

- (void)webView:(WebView *)sender windowScriptObjectAvailable: (WebScriptObject *)windowScriptObject {
	scriptObject = windowScriptObject;
	
	[windowScriptObject setValue:[appController serial] forKey:@"SerialPort"];
}

- (void)loadBundleFile:(NSString *)bundleFileName
{
	NSBundle *bundle = [NSBundle mainBundle];
	NSString *filePath = [bundle pathForResource:bundleFileName ofType:@"html"];
	
	if (!filePath) return;
		
	NSURL *url = [NSURL fileURLWithPath:filePath];
	[[self mainFrame] loadRequest:[NSURLRequest requestWithURL:url]];
}

-(void)processInput:(NSString *)input
{
	if(scriptObject != NULL){
		[scriptObject callWebScriptMethod:@"processSerialPortInput" withArguments:[NSArray arrayWithObject:input]];
	}
}

-(void)setAppController:(id)theAppController
{
	appController = theAppController;
}

@end
