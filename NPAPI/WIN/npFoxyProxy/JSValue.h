#pragma once

class CJSValue
{
public:
	CJSValue(void);
	~CJSValue(void);

public:
	static bool GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, NPVariant &varResult);
	static bool GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, int nIndex, NPVariant &varResult);

	static bool GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, int &nResult);
	static bool GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, wstring &strResult);
};
