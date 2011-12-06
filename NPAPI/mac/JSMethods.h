#pragma once

class CScriptableNPObject;

class CJSMethods
{
public:
	CJSMethods(void);
	~CJSMethods(void);

public:
	static void RegisterMethods(CScriptableNPObject *pObject);

protected:
	static bool CallJSMethod(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const char* lpszMethod, NPVariant *pArgs, const uint32_t argCount, NPVariant &varResult);

public:
	static bool SelectWindowTab(int nTabId);
	static bool ShowOptions();
	static bool NewTab();
	static bool NewWindow();
	static bool OpenUrl(wstring strUrl);


protected:
	static bool setDirect(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool setProxy(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool writeAutoPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool writeSocksPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);

	static bool saveToFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);

protected:
	static CScriptableNPObject	*m_pScriptableObject;
};
