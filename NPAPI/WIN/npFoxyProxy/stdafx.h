// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently, but
// are changed infrequently
//

#pragma once

#include "targetver.h"

#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files:
#include <windows.h>
#include <tchar.h>
#include <time.h>
#include <shlobj.h>

#define _SECURE_ATL 1

#include <atlbase.h>
#include <atlstr.h>

using namespace ATL;

#include "wininet.h"

#include <vector>
#include <map>
#include <fstream>
#include <string>
#include <algorithm>

using namespace std;

#include <npapi.h>
#include <npfunctions.h>
#include <jsapi.h>
