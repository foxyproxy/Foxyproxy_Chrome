#include "StdAfx.h"
#include "JSValue.h"

CJSValue::CJSValue(void)
{
}

CJSValue::~CJSValue(void)
{
}

bool CJSValue::GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, NPVariant &varResult)
{
	NPIdentifier npPropertyId = pBrowserFuncs->getstringidentifier(lpszProperty);

	bool bResult = pBrowserFuncs->getproperty(pluginInstance, pObject, npPropertyId, &varResult);

	return bResult;
}

bool CJSValue::GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, int nIndex, NPVariant &varResult)
{
	CHAR szIndex[10] = {0};
	sprintf_s(szIndex, "%d", nIndex);

	return GetProperty(pBrowserFuncs, pluginInstance, pObject, szIndex, varResult);
}

bool CJSValue::GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, int &nResult)
{
	NPVariant varResult;

	bool bResult = GetProperty(pBrowserFuncs, pluginInstance, pObject, lpszProperty, varResult);

	if(bResult == false)
	{
		pBrowserFuncs->releasevariantvalue(&varResult);

		return false;
	}

	if(NPVARIANT_IS_INT32(varResult) == false)
	{
		pBrowserFuncs->releasevariantvalue(&varResult);

		return false;
	}

	nResult = varResult.value.intValue;

	pBrowserFuncs->releasevariantvalue(&varResult);

	return true;
}

bool CJSValue::GetProperty(NPNetscapeFuncs *pBrowserFuncs, NPP pluginInstance, NPObject *pObject, const char* lpszProperty, wstring &strResult)
{
	NPVariant varResult;

	bool bResult = GetProperty(pBrowserFuncs, pluginInstance, pObject, lpszProperty, varResult);

	if(bResult == false)
	{
		pBrowserFuncs->releasevariantvalue(&varResult);

		return false;
	}

	if(NPVARIANT_IS_STRING(varResult) == false)
	{
		pBrowserFuncs->releasevariantvalue(&varResult);

		return false;
	}

	int nLength = varResult.value.stringValue.UTF8Length;

	if(nLength != 0)
	{
		TCHAR *lpszBuffer = new TCHAR[nLength + 2];

		int nConverted = MultiByteToWideChar(CP_UTF8, 0, varResult.value.stringValue.UTF8Characters, nLength, lpszBuffer, nLength + 1);

		lpszBuffer[nConverted] = '\0';

		strResult = lpszBuffer;

		delete [] lpszBuffer;
	}
	else
	{
		strResult.clear();
	}

	pBrowserFuncs->releasevariantvalue(&varResult);

	return true;
}