#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>


@interface MainView : WebView {
	WebScriptObject *scriptObject;
	id appController;
}

- (void)loadBundleFile:(NSString *)bundleFileName;

- (void)setAppController:(id)theAppController;

@end
