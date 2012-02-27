var ProxyConfig = {
	/* mode: 
	 * direct
		* In direct mode all connections are created directly, without any proxy involved. This mode allows no further parameters in the ProxyConfig object.
	 * auto_detect
		* In auto_detect mode the proxy configuration is determined by a PAC script that can be downloaded at http://wpad/wpad.dat. This mode allows no further parameters in the ProxyConfig object.
	 * pac_script
		* In pac_script mode the proxy configuration is determined by a PAC script that is either retrieved from the URL specified in the PacScript object or taken literally from the data element specified in the PacScript object. Besides this, this mode allows no further parameters in the ProxyConfig object.
	 * fixed_servers
		* In fixed_servers mode the proxy configuration is codified in a ProxyRules object. Its structure is described in Proxy rules. Besides this, the fixed_servers mode allows no further parameters in the ProxyConfig object.
	 * system
		* In system mode the proxy configuration is taken from the operating system. This mode allows no further parameters in the ProxyConfig object. Note that the system mode is different from setting no proxy configuration. In the latter case, Chrome falls back to the system settings only if no command-line options influence the proxy configuration. 
	*/
	// Default: System. Future: Grab existing.
	mode: "system",
	// Mode: pac_script (optional) 
	pacScript: { 
		//url: ( 
			//optional string 
		//)
		data: "function FindProxyForURL(url, host) {\n" +
			"  if (host == 'foobar.com')\n" +
			"    return 'PROXY blackhole:80';\n" +
			"  return 'DIRECT';\n" +
			"}";
	},
	// Mode: fixed_servers (optional)
	rules : {
		/* An object encapsulating the set of proxy rules for all protocols. Use either 'singleProxy' or (a subset of) 'proxyForHttp', 'proxyForHttps', 'proxyForFtp' and 'fallbackProxy'.
		 * singleProxy ( optional ProxyServer )
			The proxy server to be used for all per-URL requests (that is http, https, and ftp).
		 * proxyForHttp ( optional ProxyServer )
			The proxy server to be used for HTTP requests.
		 * proxyForHttps ( optional ProxyServer )
			The proxy server to be used for HTTPS requests.
		 * proxyForFtp ( optional ProxyServer )
			The proxy server to be used for FTP requests.
		 * fallbackProxy ( optional ProxyServer )
			The proxy server to be used for everthing else or if any of the specific proxyFor... is not specified.
		 * bypassList ( optional array of string )
			List of servers to connect to without a proxy server.
		*/
	}

};

// chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
	/* details ( object ) */
		/* value ( any ) */ 
			/* The value of the setting.
			 * Note that every setting has a specific value type, which is described together with the setting. An extension should not set a value of a different type. */
		/* scope ( optional enumerated string ["regular", "incognito_persistent", "incognito_session_only"] ) */
			/* Where to set the setting (default: regular). One of
			 * regular: 				setting for regular profile (which is inherited by the incognito profile if not overridden elsewhere),
			 * incognito_persistent: 	setting for incognito profile that survives browser restarts (overrides regular preferences),
			 * incognito_session_only: 	setting for incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular and incognito_persistent preferences). */
    /* function() {} is the callback function */
	