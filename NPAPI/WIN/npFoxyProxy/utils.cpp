#include "stdafx.h"
#include "utils.h"

WORD StringToKey(LPCTSTR lpszKey)
{
	if(_wcsicmp(lpszKey, _T("Shift")) == 0)
	{
		return MOD_SHIFT;
	}
	else if(_wcsicmp(lpszKey, _T("Alt")) == 0)
	{
		return MOD_ALT;
	}
	else if(_wcsicmp(lpszKey, _T("Ctrl")) == 0)
	{
		return MOD_CONTROL;
	}

	return 0;
}

BOOL SplitString(const wstring& str, vector<wstring>& results, const wstring delim)
{
	results.clear();

	if(str.empty())
	{
		return FALSE;
	}

	string::size_type lpos	= 0;
	string::size_type pos	= str.find(delim, lpos);

	if(pos == string::npos)
	{
		results.push_back(str);
	}
	else
	{
		while(lpos != string::npos)
		{
			results.push_back(str.substr(lpos, pos - lpos));
			lpos = (pos == string::npos)?string::npos:(pos + 1);
			pos = str.find(delim, lpos);
		}
	}

	return (results.size() != 0);
}