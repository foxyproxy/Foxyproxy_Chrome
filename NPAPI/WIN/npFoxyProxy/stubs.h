#ifndef PROC_STUBS_H_
#define PROC_STUBS_H_

static NPError StubDestroy(NPP instance, NPSavedData **save) 
{
	return NPERR_NO_ERROR;
}

static NPError StubNewStream(NPP instance, NPMIMEType type, NPStream *stream, NPBool seekable, WORD *stype) 
{
	return NPERR_NO_ERROR;
}

static NPError StubDestroyStream(NPP instance, NPStream *stream, NPReason reason) 
{
	return NPERR_NO_ERROR;
}

static void StubStreamAsFile(NPP instance,
							 NPStream* stream,
							 const char *fname) 
{

}

static int32_t StubWriteReady(NPP instance, NPStream* stream)
{
	return 0;
}

static int32_t StubWrite(NPP instance, NPStream* stream, int32_t offset, int32_t len, void* buffer) 
{
	return -1;
}

static void StubPrint(NPP instance, NPPrint *PrintInfo) 
{

}

static short StubHandleEvent(NPP instance, void* event) 
{
	return false;
}

static void StubURLNotify(NPP instance, const char *url, NPReason reason, void *notifyData) 
{
}

static NPError StubSetValue(NPP instance, NPNVariable variable, void *ret_alue) 
{
	return NPERR_NO_ERROR;
}

static NPObject *StubAllocate(NPP npp, NPClass *clazz) 
{
	NPObject *obj		= new NPObject();
	obj->_class			= clazz;
	obj->referenceCount = 0;

	return obj;
}

static void StubDeallocate(NPObject *npobj) 
{

}

static void StubInvalidate(NPObject *npobj) 
{

}

static bool StubInvokeDefault(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result) 
{
	return false;
}

static bool StubHasProperty(NPObject * npobj, NPIdentifier name) 
{
	return false;
}

static bool StubGetProperty(NPObject *npobj, NPIdentifier name,	NPVariant *result) 
{
	return false;
}

static bool StubSetProperty(NPObject *npobj, NPIdentifier name, const NPVariant *value) 
{
	return false;
}

static bool StubRemoveProperty(NPObject *npobj, NPIdentifier name) 
{
	return false;
}

static bool StubEnumerate(NPObject *npobj, NPIdentifier **identifier, uint32_t *count) 
{
	return false;
}

static bool StubConstruct(NPObject *npobj,
						  const NPVariant *args,
						  uint32_t argCount,
						  NPVariant *result) 
{
	return false;
}

NPError StubNewInstance(NPMIMEType pluginType, NPP instance, WORD mode,	short argc,	char *argn[], char *argv[],	NPSavedData *saved)
{
	return NPERR_NO_ERROR;
}

NPError StubGetValue(NPP instance, NPPVariable variable, void *value) 
{
	return NPERR_NO_ERROR;
}

NPError StubSetWindow(NPP instance, NPWindow *window) 
{
	return NPERR_NO_ERROR;
}

#endif //WEBDRIVER_STUBS_H