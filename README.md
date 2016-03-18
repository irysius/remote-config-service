#Remote Config Service

Relies on a global implementation of Promise.

This service assumes an application that takes a very particular shape, and may not be applicable for all purposes.

It is intended to be used with `@irysius/config-manager`, and relies on a server based on `@irysius/remote-config-server` being setup. 

Given environmental variables provided by the machine and application, attempts to fetch related configurations from a remote server.

For all paths, it is suggested an absolute path be provided.

## Installation

	$ npm install @irysius/remote-config-service
	
## Usage

To instantiate a service:

	var RemoteConfigService = require('@irysius/remote-config-service');
	var remoteConfigService = RemoteConfigService();
	
For now, this config service needs all of the following information to request configuration from the server:

	{
		endpoint: String,
		access_token: String,
		environment: String,
		application_key: String
	}
	
By default, the locator for the `endpoint`, `access_token` and `environment` fields are filled as candidates are located, using the following logic:

	1. First fill with values from `process.env.IRY_REMOTE_ENDPOINT`, `process.env.IRY_REMOTE_ACCESS_TOKEN`, `process.env.IRY_REMOTE_ENVIRONMENT`, if available.
	2. If the passed configuration contains the field `remote_config`, values there will then override the existing set. The service also searches for an `application_key` field on the configuration as well.
	3. If some information is still missing, throws an exception. At this time I provide no escape hatches.
	
It is suggested that the required information be obtained via environment variables as much as possible.

For more details on how the default locators work, and how to override them, consult the API section below.

<hr />

You can set environment variables in the following manner:

## On Ubuntu

	$ cd /etc/
	$ sudo vi environment
	
As an example, you may append the following line to the file:

	IRY_REMOTE_ACCESS_TOKEN="abcdefghijk"
	
**Note:** You may need to trigger a login event on the machine for the environment variables to refresh. You may also need to restart your application.

## On Windows 7

1. Right click `Computer`, and select `Properties`.
2. Go to `Advanced system settings`.
3. On the System Properties Window, click on `Environment Variables...`.
4. Under System variables, click `New...`.

As an example, enter the following values in the New System Variable window.

	Variable name: IRY_REMOTE_ACCESS_TOKEN
	Variable value: abcdefghijk
	
**Note:** Make sure you OK out all the windows opened during the process. You will need to restart your process or prompt for the new variables to take effect.

<hr />

It is assumed the config will be assembled in the following manner:

	configManager
		.use(remoteConfigService)
		.assemble().then(function (config) {
			// Use config
		});
		
But you may use it as a standalone like so:

	remoteConfigService.transform(prevConfig).then(function (config) {
		// Use config
	});
	
## API
### interface ConnectionInfo
	
	{
		endpoint?: String,
		access_token?: String,
		environment?: String,
		application_key?: String
	}

### constructor
`RemoteConfigService(options?: { initialLocator?: (ConnectionInfo) => ConnectionInfo, jitLocator?: (Config, ConnectionInfo) => ConnectionInfo })`

Constructor for the config service. You may override the default locators (for the connection information) by providing an alternate implementation.

The initial locator is ran at service creation. This sets the base of the connection information.

The just-in-time locator is ran just before `remoteConfigService.transform` attempts a call to the remote server. The `application_key` field is usually provided by this time.

### RemoteConfigService.defaults.initialLocator
`(ConnectionInfo) => ConnectionInfo`

Default implementation of the initial locator of the connection information.

Sets the following fields (should the values exist), then returns the updated info:

* `endpoint` gets assigned with `process.env.IRY_REMOTE_ENDPOINT`.
* `access_token` gets assigned with `process.env.IRY_REMOTE_ACCESS_TOKEN`.
* `environment` gets assigned with `process.env.IRY_REMOTE_ENVIRONMENT`.

### RemoteConfigService.defaults.jitLocator
`(Config, ConnectionInfo) => ConnectionInfo`

Default implementation of the just-in-time locator of the connection information.

Sets the following fields (should the values exist), then returns the updated info:

* `endpoint` gets assigned with `prevConfig.remote_config.endpoint`.
* `access_token` gets assigned with `prevConfig.remote_config.access_token`.
* `environment` gets assigned with `prevConfig.remote_config.environment`.
* `application_key` gets assigned with `prevConfig.remote_config.application_key`.
* `application_key` gets assigned with `prevConfig.application_key`.

### remoteConfigService.transform
`remoteConfigService.transform(prevConfig: {}) => Promise<nextConfig: {}>`

Performs a call to the remote server using ConnectionInfo, then merges in the obtained configuration.

Returns the Promise of the new configuration, or rejects the chain if ConnectionInfo is missing values and the service is allowed to throw.