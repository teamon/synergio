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
	Synergio *syn = [[Synergio alloc] init];
	[windowScriptObject setValue:syn forKey:@"Synergio"];
}

- (void)loadBundleFile:(NSString *)bundleFileName
{
	NSBundle *bundle = [NSBundle mainBundle];
	NSString *filePath = [bundle pathForResource:bundleFileName ofType:@"html"];
	
	if (!filePath) return;
		
	NSURL *url = [NSURL fileURLWithPath:filePath];
	[[self mainFrame] loadRequest:[NSURLRequest requestWithURL:url]];
}

@end
