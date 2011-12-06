#include "StdAfx.h"
#include "Proxy.h"

#include <atlbase.h>
#include <atlcoll.h>
#include <Commdlg.h>

CProxy::CProxy()
{
	m_autoPacScriptPath = "";
	m_socksPacScriptPath = "";
	updateLocalIps();
}

CString CProxy::get_autoPacScriptPath()
{
	return "file://"+m_autoPacScriptPath;
}

CString CProxy::get_socksPacScriptPath()
{
	return "file://"+m_socksPacScriptPath;
}


bool CProxy::writeAutoPacFile(CString script)
{
	if (m_autoPacScriptPath.IsEmpty())
	{
		TCHAR szPath[MAX_PATH];
		TCHAR szTempFileName[MAX_PATH]; 
		if (SUCCEEDED(SHGetFolderPath(NULL, CSIDL_COMMON_APPDATA, NULL, 0, szPath)))
		{
			PathAppend(szPath, L"\\FoxyProxy\\");
			CreateDirectory(szPath, NULL);
			if (!GetTempFileName(szPath, _T(""), 0, szTempFileName))
				return false;
			m_autoPacScriptPath = szTempFileName;
		} 
	}



	if (script.IsEmpty())
		return false;


	if (m_autoPacScriptPath.IsEmpty())
		return false;

	if (script.IsEmpty())
		return false;

	std:: wofstream ofs;
	ofs.open (m_autoPacScriptPath, ios::out );
	if(ofs.fail())
		return false;
	
	int length = script.GetLength();
	TCHAR * buf = script.GetBuffer();
	ofs.write(buf,length);
	script.ReleaseBuffer();
	return true;

}

bool CProxy::writeSocksPacFile(CString script)
{
	if (m_socksPacScriptPath.IsEmpty())
	{
		TCHAR szPath[MAX_PATH];
		TCHAR* szTempFileName = (TCHAR*)malloc(MAX_PATH * sizeof(TCHAR)); 
		if (SUCCEEDED(SHGetFolderPath(NULL, CSIDL_COMMON_APPDATA, NULL, 0, szPath)))
		{
			PathAppend(szPath, L"\\FoxyProxy\\");
			CreateDirectory(szPath, NULL);
			if (!GetTempFileName(szPath, _T(""), 0, szTempFileName))
				return false;
			m_socksPacScriptPath = szTempFileName;
		} 
	}

	if (m_socksPacScriptPath.IsEmpty())
		return false;

	if (script.IsEmpty())
		return false;

	std:: wofstream ofs;
	ofs.open (m_socksPacScriptPath, ios::out );
	if(ofs.fail())
		return false;
	
	int length = script.GetLength();
	TCHAR * buf = script.GetBuffer();
	ofs.write(buf,length);
	script.ReleaseBuffer();
	

	ofs.close();
	return true;

}

bool CProxy::setDirect(CString connection)
{
	INTERNET_PER_CONN_OPTION ipco[2];
	INTERNET_PER_CONN_OPTION_LIST ipcoList;
	ipcoList.dwSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);
	ipcoList.pszConnection = NULL;
	ipcoList.pOptions = ipco;
	ipcoList.dwOptionCount = 0;
	ipcoList.dwOptionError = 0;

	HRESULT hr = E_FAIL;

	ipco[0].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
	ipco[0].Value.pszValue = _T("");
	ipco[1].dwOption = INTERNET_PER_CONN_FLAGS;
	ipco[1].Value.dwValue = PROXY_TYPE_DIRECT/*|PROXY_TYPE_AUTO_DETECT*/;
	ipcoList.dwOptionCount = 2;
	hr = S_OK;

	if (SUCCEEDED(hr))
	{
		if (InternetSetOption(NULL,
			INTERNET_OPTION_PER_CONNECTION_OPTION,
			&ipcoList,
			sizeof(INTERNET_PER_CONN_OPTION_LIST)))
		{
			InternetSetOption(NULL, INTERNET_OPTION_SETTINGS_CHANGED, NULL, 0);
			InternetSetOption(NULL, INTERNET_OPTION_REFRESH, NULL, 0);
			hr = S_OK;
		}
		else
		{
			hr = HRESULT_FROM_WIN32(GetLastError());
		}
	}
	return true;
}

bool CProxy::setProxy(CString proxyMode, CString proxyString, CString proxyExceptions, 
									CString proxyConfigUrl, CString connection)
{
	INTERNET_PER_CONN_OPTION ipco[2];
	INTERNET_PER_CONN_OPTION_LIST ipcoList;
	ipcoList.dwSize = sizeof(INTERNET_PER_CONN_OPTION_LIST);
	ipcoList.pszConnection = NULL;
	ipcoList.pOptions = ipco;
	ipcoList.dwOptionCount = 0;
	ipcoList.dwOptionError = 0;

	HRESULT hr = E_FAIL;

	if (0 == wcscmp(L"manual", proxyMode))
	{
		if ((proxyString.IsEmpty()) || (*proxyString == L'\0') || (0 == wcscmp(L"none", proxyString)))
		{
			ipco[0].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
			ipco[0].Value.pszValue = _T("");
			ipco[1].dwOption = INTERNET_PER_CONN_FLAGS;
			ipco[1].Value.dwValue = PROXY_TYPE_DIRECT;
			ipcoList.dwOptionCount = 2;
			hr = S_OK;
		}
		else
		{
			ipco[0].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
			ipco[0].Value.pszValue = proxyString.GetBuffer();
			ipco[1].dwOption = INTERNET_PER_CONN_FLAGS;
			ipco[1].Value.dwValue = PROXY_TYPE_PROXY;
//			use it for exceptions
// 			ipco[2].dwOption = INTERNET_PER_CONN_PROXY_BYPASS;
// 			ipco[2].Value.pszValue = proxyExceptions;
			ipcoList.dwOptionCount = 2;
			hr = S_OK;
		}

		if (SUCCEEDED(hr))
		{
			if (InternetSetOption(NULL,
				INTERNET_OPTION_PER_CONNECTION_OPTION,
				&ipcoList,
				sizeof(INTERNET_PER_CONN_OPTION_LIST)))
			{
				InternetSetOption(NULL, INTERNET_OPTION_SETTINGS_CHANGED, NULL, 0);
				InternetSetOption(NULL, INTERNET_OPTION_REFRESH, NULL, 0);
				hr = S_OK;
			}
			else
			{
				hr = HRESULT_FROM_WIN32(GetLastError());
			}
		}
	}
	else if (0 == wcscmp(L"auto", proxyMode) && 
		!(proxyConfigUrl.IsEmpty())) // pac file
	{
		CComVariant empty;
		setDirect("");
		ipco[0].dwOption = INTERNET_PER_CONN_AUTOCONFIG_URL;
		ipco[0].Value.pszValue = proxyConfigUrl.GetBuffer();
		ipco[1].dwOption = INTERNET_PER_CONN_FLAGS;
		ipco[1].Value.dwValue = /*PROXY_TYPE_DIRECT|*//*PROXY_TYPE_AUTO_DETECT|*/PROXY_TYPE_AUTO_PROXY_URL;
		ipcoList.dwOptionCount = 2;
		hr = S_OK;

		if (SUCCEEDED(hr))
		{
			if (InternetSetOption(NULL,
				INTERNET_OPTION_PER_CONNECTION_OPTION,
				&ipcoList,
				sizeof(INTERNET_PER_CONN_OPTION_LIST)))
			{
				InternetSetOption(NULL, INTERNET_OPTION_SETTINGS_CHANGED, NULL, 0);
				InternetSetOption(NULL, INTERNET_OPTION_REFRESH, NULL, 0);
				hr = S_OK;
			}
			else
			{
				hr = HRESULT_FROM_WIN32(GetLastError());
			}
		}
	}
	return true;
}

bool CProxy::save(CString data)
{
	HANDLE hFile(NULL);
	TCHAR szFileName[MAX_PATH];
	//szFileName[0] = '\0';
	_tcscpy(szFileName, _T("untitled"));
	OPENFILENAME ofn;
	memset(&ofn, 0, sizeof(OPENFILENAME));
	ofn.lStructSize = sizeof(OPENFILENAME);
	ofn.hwndOwner = NULL;
	ofn.lpstrFilter = L"All\0*.*\0";
	ofn.lpstrFile = szFileName;
	ofn.nMaxFile = MAX_PATH;
	ofn.lpstrDefExt = L"";
	ofn.Flags = OFN_EXPLORER | OFN_OVERWRITEPROMPT;
	if (GetSaveFileName(&ofn))
	{
		hFile = CreateFile(szFileName, GENERIC_WRITE | GENERIC_READ, 0, NULL, CREATE_ALWAYS, 
			FILE_ATTRIBUTE_NORMAL | FILE_FLAG_SEQUENTIAL_SCAN, NULL);
		if(hFile == INVALID_HANDLE_VALUE)
			return E_FAIL;

		SetFilePointer(hFile, 0, NULL, FILE_BEGIN);
		DWORD sz(sizeof(data));
		WriteFile(hFile, static_cast<void*>(CW2A(data.GetBuffer())), data.GetLength(), &sz, NULL);
		CloseHandle(hFile);
	}
	return true;
}

bool CProxy::updateLocalIps()
{
	CString res = _T("");
	CRegKey key;
	if(key.Open(HKEY_LOCAL_MACHINE, _T("SYSTEM\\CurrentControlSet\\services\\Tcpip\\Parameters\\Interfaces"), KEY_READ) == ERROR_SUCCESS)
	{
		CString subName;
		CAtlList<CString> list;
		DWORD i = 0, nameLength = 256;
		while(key.EnumKey(i, subName.GetBuffer(nameLength), &nameLength) == ERROR_SUCCESS)
		{
			subName.ReleaseBuffer(nameLength);
			CRegKey subkey;
			if(subkey.Open(key.m_hKey, subName, KEY_READ) == ERROR_SUCCESS)
			{
				DWORD valueLength;
				CString value;
				if(subkey.QueryStringValue(_T("DhcpIPAddress"), value.GetBuffer(valueLength = MAX_PATH), &valueLength) == ERROR_SUCCESS ||
					subkey.QueryMultiStringValue(_T("DhcpIPAddress"), value.GetBuffer(valueLength = MAX_PATH), &valueLength) == ERROR_SUCCESS ||
					subkey.QueryStringValue(_T("IPAddress"), value.GetBuffer(valueLength = MAX_PATH), &valueLength) == ERROR_SUCCESS ||
					subkey.QueryMultiStringValue(_T("IPAddress"), value.GetBuffer(valueLength = MAX_PATH), &valueLength) == ERROR_SUCCESS)
				{
					value.ReleaseBuffer(valueLength);
					value.Trim();
					if(value != _T("0.0.0.0") &&
						list.Find(value) == NULL)
					{
						list.AddTail(value);
						if(!res.IsEmpty())
							res += _T(",\"");
						else
							res += _T("\"");
						res += value;
						res += _T("\"");
					}
				}
			}
			nameLength = 256;
			++i;
		}
		if (!res.IsEmpty())
			res = _T("[") + res + _T("]");
	}
	m_localIps = res;
	return true;
}
