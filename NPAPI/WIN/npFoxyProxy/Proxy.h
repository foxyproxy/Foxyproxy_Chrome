#pragma once

class CProxy
{
private:	
	CString m_autoPacScriptPath;
	CString m_socksPacScriptPath;
public:
	CString m_localIps;
	CProxy();
	CString get_autoPacScriptPath();
	void put_autoPacScriptPath(CString path);
	CString get_socksPacScriptPath();
	void put_socksPacScriptPath(CString path);
	bool writeAutoPacFile(CString script);
	bool writeSocksPacFile(CString script);
	bool setDirect(CString connection);
	bool setProxy(CString proxyMode, CString proxyString, CString proxyExceptions, 
									CString proxyConfigUrl, CString connection);
	bool save(CString data);
	bool updateLocalIps();
};

extern CProxy	g_Proxy;