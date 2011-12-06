#include "stdafx.h"

#include "stubs.h"


#include "Proxy.h"
#include "ScriptableNPObject.h"
#include "JSMethods.h"

static NPNetscapeFuncs *g_BrowserFuncs	= NULL;
static NPPluginFuncs *g_PluginFuncs		= NULL;

/*#pragma data_seg("Shared")
HINSTANCE g_hInstance = NULL;
#pragma data_seg()*/

CProxy	g_Proxy;

BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved)
{
	switch (ul_reason_for_call)
	{
		case DLL_PROCESS_ATTACH:
		case DLL_THREAD_ATTACH:
		case DLL_THREAD_DETACH:
		case DLL_PROCESS_DETACH:
			break;
	}

	return TRUE;
}

NPError SetWindow(NPP instance, NPWindow *window) 
{
	return NPERR_NO_ERROR;
}

NPError Destroy(NPP instance, NPSavedData **save) 
{
	return NPERR_NO_ERROR;
}

NPError GetValue(NPP instance, NPPVariable variable, void *value)
{
	switch (variable) 
	{
	case NPPVpluginScriptableNPObject: 
		{
			NPObject *listener = (NPObject*)g_BrowserFuncs->createobject(instance, &CScriptableNPObject::m_npClass);
			CJSMethods::RegisterMethods((CScriptableNPObject*)listener);
			*((NPObject**)value) = listener;
		}
		break;

	default: 
		return NPERR_INVALID_PARAM;
		break;
	}

	return NPERR_NO_ERROR;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////

NPError OSCALL NP_GetEntryPoints(NPPluginFuncs* pFuncs)
{
	if (g_PluginFuncs != NULL) 
	{
		return NPERR_INVALID_FUNCTABLE_ERROR;
	}

	g_PluginFuncs = pFuncs;

	pFuncs->newp			= StubNewInstance;
	pFuncs->destroy			= Destroy;
	pFuncs->setwindow		= SetWindow;
	pFuncs->newstream		= StubNewStream;
	pFuncs->destroystream	= StubDestroyStream;
	pFuncs->asfile			= StubStreamAsFile;
	pFuncs->writeready		= StubWriteReady;
	pFuncs->write			= StubWrite;
	pFuncs->print			= StubPrint;
	pFuncs->event			= StubHandleEvent;
	pFuncs->urlnotify		= StubURLNotify;
	pFuncs->getvalue		= GetValue;
	pFuncs->setvalue		= StubSetValue;

	return NPERR_NO_ERROR;
}

NPError OSCALL NP_Initialize(NPNetscapeFuncs *aNPNFuncs)
{
	if (g_BrowserFuncs != NULL) 
		return NPERR_INVALID_FUNCTABLE_ERROR;

	g_BrowserFuncs = aNPNFuncs;

	CScriptableNPObject::m_pBrowserFuncs = g_BrowserFuncs;

	return NPERR_NO_ERROR;
}

NPError OSCALL NP_Shutdown(void)
{
	return NPERR_NO_ERROR;
}