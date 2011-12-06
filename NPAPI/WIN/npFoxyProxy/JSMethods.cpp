#include "StdAfx.h"

#include "Proxy.h"
#include "JSMethods.h"
#include "JSValue.h"
#include "ScriptableNPObject.h"


#include "utils.h"

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
	pObject->RegisterMethod("saveToFile",save);
	pObject->RegisterMethod("updateLocalIps",updateIps);
}

bool CJSMethods::setDirect(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{

	g_Proxy.setDirect(args[0].value.stringValue.UTF8Characters);
	return true;
}

CString NPtoC(const NPString &str )
{
	CString tmp(str.UTF8Characters);
	return tmp.Left(str.UTF8Length);
}

bool CJSMethods::setProxy(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{

	g_Proxy.setProxy(NPtoC(args[0].value.stringValue),NPtoC(args[1].value.stringValue),
			NPtoC(args[2].value.stringValue),NPtoC(args[3].value.stringValue),
			NPtoC(args[4].value.stringValue));
	return true;
}

bool CJSMethods::writeAutoPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	g_Proxy.writeAutoPacFile(args[0].value.stringValue.UTF8Characters);
	return true;
}

bool CJSMethods::writeSocksPacFile(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	g_Proxy.writeSocksPacFile(args[0].value.stringValue.UTF8Characters);
	return true;
}

bool CJSMethods::save(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	g_Proxy.save(args[0].value.stringValue.UTF8Characters);
	return true;
}

bool CJSMethods::updateIps(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, const uint32_t argCount, const NPVariant *args)
{
	g_Proxy.updateLocalIps();
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