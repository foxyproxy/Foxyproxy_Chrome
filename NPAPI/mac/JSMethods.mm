

#include "JSMethods.h"
#include "ScriptableNPObject.h"




CScriptableNPObject* CJSMethods::m_pScriptableObject = NULL;

CJSMethods::CJSMethods(void)
{
}

CJSMethods::~CJSMethods(void)
{
}

void CJSMethods::RegisterMethods(CScriptableNPObject *pObject)
{
	m_pScriptableObject = pObject;

	pObject->RegisterMethod("setProxy", setProxy);
	pObject->RegisterMethod("setDirect",setDirect);
	pObject->RegisterMethod("writeAutoPacFile",writeAutoPacFile);
	pObject->RegisterMethod("writeSocksPacFile",writeSocksPacFile);
	pObject->RegisterMethod("saveToFile",saveToFile);
}

bool CJSMethods::writeAutoPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	ofstream file;
	file.open("/tmp/auto.pac");
	file << args[0].value.stringValue.UTF8Characters;
	file.close();
	return true;
}

bool CJSMethods::writeSocksPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	ofstream file;
	file.open("/tmp/socks.pac");
	file << args[0].value.stringValue.UTF8Characters;
	file.close();
	return true;
}

bool CJSMethods::setDirect(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	CFOptionFlags result;
	AuthorizationRef auth = nil;
	OSStatus authErr = noErr;
	AuthorizationFlags rootFlags = kAuthorizationFlagDefaults 
	| kAuthorizationFlagExtendRights | kAuthorizationFlagInteractionAllowed
	| kAuthorizationFlagPreAuthorize;
	authErr = AuthorizationCreate(nil, kAuthorizationEmptyEnvironment, rootFlags, &auth);
	if (authErr != noErr) {
		CFUserNotificationDisplayAlert(0, kCFUserNotificationNoteAlertLevel, NULL, NULL, NULL, CFSTR("Auth error"), CFSTR("qwe"), NULL, CFSTR("Cancel"), NULL, &result);
	}
	
	SCPreferencesRef prefsR;
	CFStringRef appName = CFSTR("npFoxyProxy");
	prefsR = SCPreferencesCreateWithAuthorization(NULL, appName, NULL, auth);
	Boolean gotLock = SCPreferencesLock(prefsR, FALSE);
	if (!gotLock) {
		CFUserNotificationDisplayAlert(0, kCFUserNotificationNoteAlertLevel, NULL, NULL, NULL, CFSTR("Cant get lock"), CFSTR("qwe"), NULL, CFSTR("Cancel"), NULL, &result);
		
	}
	SCNetworkSetRef networkSetR = SCNetworkSetCopyCurrent(prefsR);
	CFArrayRef networkServicesArrayR = SCNetworkSetCopyServices(networkSetR);
	for(CFIndex i=0;i<CFArrayGetCount(networkServicesArrayR);i++)
	{
		SCNetworkServiceRef serviceR = (SCNetworkServiceRef)CFArrayGetValueAtIndex(networkServicesArrayR, i);
		SCNetworkProtocolRef protoR = SCNetworkServiceCopyProtocol(serviceR, kSCNetworkProtocolTypeProxies);
		if(SCNetworkProtocolGetEnabled(protoR) == TRUE)
		{
			
			CFDictionaryRef proxyDictR = SCNetworkProtocolGetConfiguration(protoR);
			if (proxyDictR != nil) {
			
			CFMutableDictionaryRef newProxyDictR = CFDictionaryCreateMutableCopy(NULL, 0, proxyDictR);
			
		
			int enabled = 0;
			CFNumberRef num = CFNumberCreate(NULL, kCFNumberIntType, &enabled);
			//CFNumberRef a=(CFNumberRef)CFDictionaryGetValue(newProxyDictR, kSCPropNetProxiesHTTPEnable);
			
			CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesProxyAutoConfigEnable, num);
			CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPEnable, num);
			CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPSEnable, num);
			CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesFTPEnable, num);
			//Value(newProxyDictR, kSCPropNetProxiesHTTPEnable);

			SCNetworkProtocolSetConfiguration(protoR, newProxyDictR);
			CFRelease(newProxyDictR);
			}
			
		}
		
	}
	CFRelease(networkServicesArrayR);
	CFRelease(networkSetR);
	
	bool ok;
	ok = SCPreferencesCommitChanges(prefsR);
	if(ok)
	{
		ok = SCPreferencesApplyChanges(prefsR);
	}
	SCPreferencesUnlock(prefsR);
	CFRelease(prefsR);
	AuthorizationFree(auth, rootFlags);
	return ok;
}

CFStringRef CFStringFromNPString(const NPString *string)
{
	const NPUTF8 *tmp = string->UTF8Characters;
	int len = strlen(tmp);
	return CFStringCreateWithBytes(NULL, (const UInt8*)tmp, (CFIndex)len, kCFStringEncodingUTF8, false);
}

bool CJSMethods::setProxy(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	
	CFOptionFlags result;
	AuthorizationRef auth = nil;
	OSStatus authErr = noErr;
	AuthorizationFlags rootFlags = kAuthorizationFlagDefaults 
	| kAuthorizationFlagExtendRights | kAuthorizationFlagInteractionAllowed
	| kAuthorizationFlagPreAuthorize;
	authErr = AuthorizationCreate(nil, kAuthorizationEmptyEnvironment, rootFlags, &auth);
	if (authErr != noErr) {
		CFUserNotificationDisplayAlert(0, kCFUserNotificationNoteAlertLevel, NULL, NULL, NULL, CFSTR("Auth error"), CFSTR("qwe"), NULL, CFSTR("Cancel"), NULL, &result);
	}

	SCPreferencesRef prefsR;
	CFStringRef appName = CFSTR("npFoxyProxy");
	prefsR = SCPreferencesCreateWithAuthorization(NULL, appName, NULL, auth);
	Boolean gotLock = SCPreferencesLock(prefsR, FALSE);
	if (!gotLock)return false;
	
	SCNetworkSetRef networkSetR = SCNetworkSetCopyCurrent(prefsR);
	CFArrayRef networkServicesArrayR = SCNetworkSetCopyServices(networkSetR);
	
	int t=1;
	CFNumberRef enabled = CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType, &t);
	t=0;
	CFNumberRef disabled = CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType, &t);
	
	
	CFStringRef mode = CFStringFromNPString(&args[0].value.stringValue);
	if(CFStringCompare(mode, CFSTR("manual"), kCFCompareCaseInsensitive)==kCFCompareEqualTo)
	{
		
		
		CFStringRef host = CFStringFromNPString(&args[1].value.stringValue);
		CFArrayRef arr = CFStringCreateArrayBySeparatingStrings(NULL, host, CFSTR(":"));
		
		
		CFStringRef proxyHost = (CFStringRef)CFArrayGetValueAtIndex(arr, 0);
		t = CFStringGetIntValue((CFStringRef)CFArrayGetValueAtIndex(arr, 1));
		CFNumberRef proxyPort = CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType, &t);
		
		for(CFIndex i=0;i<CFArrayGetCount(networkServicesArrayR);i++)
		{
			SCNetworkServiceRef serviceR = (SCNetworkServiceRef)CFArrayGetValueAtIndex(networkServicesArrayR, i);
			SCNetworkProtocolRef protoR = SCNetworkServiceCopyProtocol(serviceR, kSCNetworkProtocolTypeProxies);
			if(SCNetworkProtocolGetEnabled(protoR))
			{
				CFDictionaryRef proxyDictR = SCNetworkProtocolGetConfiguration(protoR);
				
				if (proxyDictR != nil) {
				CFMutableDictionaryRef newProxyDictR = CFDictionaryCreateMutableCopy(NULL, 0, proxyDictR);
			
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesProxyAutoConfigEnable, disabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPEnable, enabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPProxy, proxyHost);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPPort, proxyPort);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPSEnable, enabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPSProxy, proxyHost);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPSPort, proxyPort);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesFTPEnable, enabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesFTPProxy, proxyHost);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesFTPPort, proxyPort);

				
				SCNetworkProtocolSetConfiguration(protoR, newProxyDictR);
				CFRelease(newProxyDictR);
				}
			}
		
		}
	}else if(CFStringCompare(mode, CFSTR("auto"), kCFCompareCaseInsensitive)==kCFCompareEqualTo)
	{
		for(CFIndex i=0;i<CFArrayGetCount(networkServicesArrayR);i++)
		{
			SCNetworkServiceRef serviceR = (SCNetworkServiceRef)CFArrayGetValueAtIndex(networkServicesArrayR, i);
			SCNetworkProtocolRef protoR = SCNetworkServiceCopyProtocol(serviceR, kSCNetworkProtocolTypeProxies);
			if(SCNetworkProtocolGetEnabled(protoR))
			{
				CFDictionaryRef proxyDictR = SCNetworkProtocolGetConfiguration(protoR);
				if (proxyDictR != nil) {
				CFMutableDictionaryRef newProxyDictR = CFDictionaryCreateMutableCopy(NULL, 0, proxyDictR);
				
				
				CFStringRef configUrl = CFStringFromNPString(&args[3].value.stringValue);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesProxyAutoConfigEnable, enabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesProxyAutoConfigURLString, configUrl);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPEnable, disabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesHTTPSEnable, disabled);
				CFDictionarySetValue(newProxyDictR, kSCPropNetProxiesFTPEnable, disabled);
				
				
				SCNetworkProtocolSetConfiguration(protoR, newProxyDictR);
				CFRelease(newProxyDictR);
				}
			}
			
		}
	}
	
	CFRelease(enabled);
	CFRelease(disabled);
	CFRelease(mode);
	CFRelease(networkServicesArrayR);
	CFRelease(networkSetR);
	
	bool ok;
	ok = SCPreferencesCommitChanges(prefsR);
	if(ok)
	{
		ok = SCPreferencesApplyChanges(prefsR);
				
	}
	SCPreferencesUnlock(prefsR);
	CFRelease(prefsR);
	AuthorizationFree(auth, rootFlags);
	return ok;
}

bool CJSMethods::saveToFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	const NPUTF8 *npString = args[0].value.stringValue.UTF8Characters;
	if (argCount < 1 || npString == nil) {
		return false;
	}
	const NSUInteger npStringLength = (NSUInteger)args[0].value.stringValue.UTF8Length;
	
	NSString * dataString = [[NSString alloc] initWithBytes: (const void*)npString
													 length: npStringLength
												   encoding: NSUTF8StringEncoding];
	
	NSSavePanel* panel = [NSSavePanel savePanel];
	[panel setAllowedFileTypes: [NSArray arrayWithObjects: @"txt", nil]];
	[panel setNameFieldStringValue: @"untitled"];
	
	if ( [panel runModal] == NSOKButton) {
		NSString *filename = [[panel URL] path];
		BOOL bRes = [dataString writeToFile: filename 
					 atomically: NO
					   encoding: NSUTF8StringEncoding 
						  error: NULL];
		if (bRes) {
			// File succesfully saved
		}
	}
	[dataString release];
	
	return true;
}


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////

bool CJSMethods::CallJSMethod(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const char* lpszMethod, NPVariant *pArgs, const uint32_t argCount, NPVariant &varResult)
{
	if(pluginInstance == NULL || pBrowserFuncs == NULL)
	{
		return false;
	}

	NPObject* npWindow = NULL;

	pBrowserFuncs->getvalue(pluginInstance, NPNVWindowNPObject, &npWindow);

	if(npWindow == NULL)
	{
		return false;
	}

	NPVariant varDocument;

	NPIdentifier idDocument = pBrowserFuncs->getstringidentifier("document");

	pBrowserFuncs->getproperty(pluginInstance, npWindow, idDocument, &varDocument);

	NPObject* npDocument = NPVARIANT_TO_OBJECT(varDocument);

	if(npDocument == NULL)
	{
		pBrowserFuncs->releaseobject(npWindow);

		return false;
	}

	NPIdentifier idMethod = pBrowserFuncs->getstringidentifier(lpszMethod);

	bool bResult = pBrowserFuncs->invoke(pluginInstance, npWindow, idMethod, pArgs, argCount, &varResult);
	
	pBrowserFuncs->releasevariantvalue(&varDocument);
	pBrowserFuncs->releaseobject(npWindow);

	return bResult;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////