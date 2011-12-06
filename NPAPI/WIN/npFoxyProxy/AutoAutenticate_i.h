

/* this ALWAYS GENERATED file contains the definitions for the interfaces */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Sun May 15 22:35:01 2011
 */
/* Compiler settings for .\AutoAutenticate.idl:
    Oicf, W1, Zp8, env=Win32 (32b run), target_arch=X86 7.00.0555 
    protocol : dce , ms_ext, c_ext
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


/* verify that the <rpcndr.h> version is high enough to compile this file*/
#ifndef __REQUIRED_RPCNDR_H_VERSION__
#define __REQUIRED_RPCNDR_H_VERSION__ 440
#endif

#include "rpc.h"
#include "rpcndr.h"

#ifndef __RPCNDR_H_VERSION__
#error this stub requires an updated version of <rpcndr.h>
#endif // __RPCNDR_H_VERSION__

#ifndef COM_NO_WINDOWS_H
#include "windows.h"
#include "ole2.h"
#endif /*COM_NO_WINDOWS_H*/

#ifndef __AutoAutenticate_i_h__
#define __AutoAutenticate_i_h__

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
#pragma once
#endif

/* Forward Declarations */ 

#ifndef __IAutoAuthenticate_FWD_DEFINED__
#define __IAutoAuthenticate_FWD_DEFINED__
typedef interface IAutoAuthenticate IAutoAuthenticate;
#endif 	/* __IAutoAuthenticate_FWD_DEFINED__ */


/* header files for imported files */
#include "oaidl.h"
#include "ocidl.h"

#ifdef __cplusplus
extern "C"{
#endif 


#ifndef __IAutoAuthenticate_INTERFACE_DEFINED__
#define __IAutoAuthenticate_INTERFACE_DEFINED__

/* interface IAutoAuthenticate */
/* [unique][uuid][object] */ 


EXTERN_C const IID IID_IAutoAuthenticate;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("D0259EC2-6F52-4be5-B556-0ED9DDF916F2")
    IAutoAuthenticate : public IUnknown
    {
    public:
        virtual HRESULT STDMETHODCALLTYPE Authenticate( 
            /* [in] */ LPCWSTR Url,
            /* [in] */ LPCWSTR Headers,
            /* [out] */ HWND *phwnd,
            /* [out] */ LPWSTR *pszUsername,
            /* [out] */ LPWSTR *pszPassword) = 0;
        
    };
    
#else 	/* C style interface */

    typedef struct IAutoAuthenticateVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IAutoAuthenticate * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            __RPC__deref_out  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IAutoAuthenticate * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IAutoAuthenticate * This);
        
        HRESULT ( STDMETHODCALLTYPE *Authenticate )( 
            IAutoAuthenticate * This,
            /* [in] */ LPCWSTR Url,
            /* [in] */ LPCWSTR Headers,
            /* [out] */ HWND *phwnd,
            /* [out] */ LPWSTR *pszUsername,
            /* [out] */ LPWSTR *pszPassword);
        
        END_INTERFACE
    } IAutoAuthenticateVtbl;

    interface IAutoAuthenticate
    {
        CONST_VTBL struct IAutoAuthenticateVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IAutoAuthenticate_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IAutoAuthenticate_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IAutoAuthenticate_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IAutoAuthenticate_Authenticate(This,Url,Headers,phwnd,pszUsername,pszPassword)	\
    ( (This)->lpVtbl -> Authenticate(This,Url,Headers,phwnd,pszUsername,pszPassword) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IAutoAuthenticate_INTERFACE_DEFINED__ */


/* Additional Prototypes for ALL interfaces */

unsigned long             __RPC_USER  HWND_UserSize(     unsigned long *, unsigned long            , HWND * ); 
unsigned char * __RPC_USER  HWND_UserMarshal(  unsigned long *, unsigned char *, HWND * ); 
unsigned char * __RPC_USER  HWND_UserUnmarshal(unsigned long *, unsigned char *, HWND * ); 
void                      __RPC_USER  HWND_UserFree(     unsigned long *, HWND * ); 

/* end of Additional Prototypes */

#ifdef __cplusplus
}
#endif

#endif


