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

protected:
	static bool setDirect(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool setProxy(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	
	static bool writeAutoPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool writeSocksPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);

	static bool save(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);
	static bool updateIps(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args);

protected:
	static CScriptableNPObject	*m_pScriptableObject;
};
