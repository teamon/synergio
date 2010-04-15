#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>


@interface MainView : WebView {

}

- (void)loadBundleFile:(NSString *)bundleFileName;

@end
