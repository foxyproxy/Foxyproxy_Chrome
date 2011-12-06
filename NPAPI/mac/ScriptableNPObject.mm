#include "ScriptableNPObject.h"

NPNetscapeFuncs* CScriptableNPObject::m_pBrowserFuncs = NULL;

NPClass CScriptableNPObject::m_npClass = 
{
	NP_CLASS_STRUCT_VERSION,
	CScriptableNPObject::NP_Allocate,
	CScriptableNPObject::NP_Deallocate,
	CScriptableNPObject::NP_Invalidate,
	CScriptableNPObject::NP_HasMethod,
	CScriptableNPObject::NP_InvokeMethod,
	CScriptableNPObject::NP_InvokeDefault,
	CScriptableNPObject::NP_HasProperty,
	CScriptableNPObject::NP_GetProperty,
	CScriptableNPObject::NP_SetProperty,
	CScriptableNPObject::NP_RemoveProperty,
	CScriptableNPObject::NP_Enumerate,
	CScriptableNPObject::NP_Construct
};

CScriptableNPObject::CScriptableNPObject(NPP pluginInstance) : m_PluginInstance(pluginInstance)
{
}

CScriptableNPObject::~CScriptableNPObject(void)
{
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////

bool CScriptableNPObject::RegisterMethod(const char* lpszMethod, p_JSMethod method)
{
	m_JSMethods[lpszMethod] = method;

	return true;
}

bool CScriptableNPObject::HasMethod(const char* lpszMethod)
{
	JSMethodsMap::iterator it = m_JSMethods.find(lpszMethod);

	return (it != m_JSMethods.end());
}

bool CScriptableNPObject::CallMethod(const char* lpszMethod, const uint32_t nCount, const NPVariant *args)
{
	if(lpszMethod == NULL || lpszMethod[0] == '\0')
	{
		return false;
	}

	JSMethodsMap::iterator it = m_JSMethods.find(lpszMethod);

	if(it == m_JSMethods.end())
	{
		return false;
	}

	return (*it).second(m_pBrowserFuncs, m_PluginInstance, nCount, args);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////

bool CScriptableNPObject::HasMethod(NPIdentifier name) 
{
	const char *lpszMethod = m_pBrowserFuncs->utf8fromidentifier(name);

	return HasMethod(lpszMethod);
}

bool CScriptableNPObject::InvokeMethod(NPIdentifier name, const NPVariant *args, uint32_t argCount, NPVariant *result)
{
	const char *lpszMethod = m_pBrowserFuncs->utf8fromidentifier(name);

	
	result->type = NPVariantType_Bool;

	result->value.boolValue = CallMethod(lpszMethod, argCount, args);

	return result->value.boolValue;
}

void CScriptableNPObject::Deallocate() 
{
}

void CScriptableNPObject::Invalidate() 
{
}

bool CScriptableNPObject::InvokeDefault(const NPVariant *args, uint32_t argCount, NPVariant *result) 
{
	return false;
}

bool CScriptableNPObject::HasProperty(NPIdentifier name) 
{
	string propName(m_pBrowserFuncs->utf8fromidentifier(name));
	if (propName == "autoPacScriptPath") {
		return true;
	}
	if (propName == "socksPacScriptPath") {
		return true;
	}
	
	return false;
}

bool CScriptableNPObject::GetProperty(NPIdentifier name, NPVariant *result) 
{
	
	string propName(m_pBrowserFuncs->utf8fromidentifier(name));

	if(propName == "autoPacScriptPath")
	{
		char *t = (char*)(m_pBrowserFuncs->memalloc(100));
		strcpy(t, "file:///tmp/auto.pac");
        STRINGZ_TO_NPVARIANT(t,*result);
		return true;
	}
	if (propName == "socksPacScriptPath") {
		char *t = (char*)(m_pBrowserFuncs->memalloc(100));
		strcpy(t, "file:///tmp/socks.pac");
        STRINGZ_TO_NPVARIANT(t,*result);
		return true;
	}

	
	return false;
}

bool CScriptableNPObject::SetProperty(NPIdentifier name, const NPVariant *value) 
{
	return false;
}

bool CScriptableNPObject::RemoveProperty(NPIdentifier name) 
{
	return false;
}

bool CScriptableNPObject::Enumerate(NPIdentifier **identifier, uint32_t *count) 
{
	return false;
}

bool CScriptableNPObject::Construct(const NPVariant *args, uint32_t argCount, NPVariant *result) 
{
	return false;
}