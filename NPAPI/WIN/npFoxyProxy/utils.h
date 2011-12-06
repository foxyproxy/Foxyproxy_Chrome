#pragma once

WORD StringToKey(LPCTSTR lpszKey);
BOOL SplitString(const wstring& str, vector<wstring>& results, const wstring delim);