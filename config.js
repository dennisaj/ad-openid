  // Don't commit this file to your public repos. This config is for first-run
  //

  var local = {
		dennisauto : {c: 'ccf7e84d-cb53-4364-ba9e-81b33551200e', k:'4zYIRTqYr3wMFbHqx/CGDbIsqy6dAiU1GdgUIj1pXIs=', o:'160b55c1-3dcf-4637-9931-03deeef39b07'},
  	tenant : '65888785-a93c-4c8f-89eb-d42bf7d03244',
  	subscription : '186ab797-9eed-4104-8b38-2d3cfc36bab4',
  	devapi : {c: 'b9ace97e-3433-47bd-83d2-207018b2972b', k: '0xNma6SyUuoCjUHOIHcTWwQuG8YDU0yuVfN3MIkiXQ8=', o: '38681f64-4ecb-4985-8966-3bb3f57d82e5'},
  	djsdk : {c: '61c3dfda-d603-47e5-82e1-baf899447d07', k: 'mnVyA0XaKMzbnbb7YCNlcVw16ofZW/hPAIXJJIj4Zkc=', o: '38681f64-4ecb-4985-8966-3bb3f57d82e5'},
  	endpoint : 'EndPoint=sb://dennissb.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=vDmqd1zpbYgfz+ENu2/82pTbLQepY3KCeXrPQmFowtc=',
		channel : 'https://azure-logs-qa.evident.io/3954?token=2XXzEcXnMyXHydc93NU47dNy'
  };

exports.creds = {
		redirectUrl: 'https://localhost:3000/auth/openid/return',
		// For using Microsoft you should never need to change this.
		// https://login.microsoftonline.com/65888785-a93c-4c8f-89eb-d42bf7d03244/oauth2/authorize
		identityMetadata: 'https://login.microsoftonline.com/' + local.tenant + '/', 
		realm: 'http://localhost:3000',
		issuer: ['https://login.microsoftonline.com/' + local.tenant],
 		clientID: local.djsdk.c,
 		clientSecret: local.djsdk.k,
		skipUserProfile: true, // for OpenID only flows this should be set to true
		// Recommended to set to true. By default we save state in express session, if this option is set to true, then
		// we encrypt state and save it in cookie instead. This option together with { session: false } allows your app
		// to be completely express session free.
		useCookieInsteadOfSession: true,
		
		// Required if `useCookieInsteadOfSession` is set to true. You can provide multiple set of key/iv pairs for key
		// rollover purpose. We always use the first set of key/iv pair to encrypt cookie, but we will try every set of
		// key/iv pair to decrypt cookie. Key can be any string of length 32, and iv can be any string of length 12.
		cookieEncryptionKeys: [ 
			{ 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
			{ 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
		],
		responseType: 'code id_token', // for login only flows
		responseMode: 'form_post', // As per the OAuth 2.0 standard.
		resourceURL: 'https://graph.windows.net'
		// scope: ['profile', 'offline_access'],
};
