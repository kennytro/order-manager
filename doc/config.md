# Client Configuration
## Custom Logo
Replace 'client/src/favicon.ico' to use a custom logo instead of default logo.

*** 
# Auth0 Configuration
## Applications
Create two applications, one for 'SINGLE PAGE APPLICATION' type and another one for 'MACHINE TO MACHINE' type. SPA type application authorized front end application, and MTM type application authrozies back end server. SPA app settings are set in environment variables which back end server provides to front end app. MTM app settings are used by back end server to initialize Auth0 environment.

For the SPA application, disable social connection such as google.
## API
Create an API audience. Enable 'Allow Skipping User Consent' and 'Authorize' the MTM application. 
## Rules
Create a rule that attaches both app and user meta data to user payload.
```javascript
function (user, context, callback) {
  const namespace = 'https://<Name space>/';
  if (user.user_metadata) {
    context.idToken[namespace + 'user_metadata'] = user.user_metadata;
  }
  if (user.app_metadata) {
    context.idToken[namespace + 'app_metadata'] = user.app_metadata;
  }
  callback(null, user, context);
}
```
***

# Server Configuration
## Auth0 settings
Back end server requires the following environment variables to access Auth0

|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------:|-----------|
|AUTH0_DOMAIN_ID|Y||Domain of the application in Auth0 acount|
|AUTH0_CLIENT_ID|Y||Client ID of the application in Auth0 account|
|AUTH0_CONNECTION|Y||Auth0 connection authentication type|
|AUTH0_AUDIENCE|Y||Auth0 API URL(e.g. https://<AUTH0_DOMAIN_ID>/api/v2/|
|AUTH0_API_CLIENT_ID|N||Client ID of the machine to machine type application. With AUTH0_API_CLIENT_SECRET, back end server initializes Auth0 environment such as creating default 'admin' user|
|AUTH0_API_CLIENT_SECRET|N||Client secret of the machine to machine type application. This varialbe is needed to initialize Auth0 environment.|
|ADMIN_EMAIL|N||Email of the default administrator user|
|ADMIN_PW|N||Password of the default administrator user|

When back end server starts up for the first time, it needs to create an administrator user so that administrator user can login to finish initialization tasks via front end application. For creation of administrator user, the following environment variables are required - AUTH0_API_CLIENT_ID, AUTH0_API_CLIENT_SECRET, ADMIN_EMAIL and ADMIN_PW -, and they are not required once the administrator user is created.

## Resource settings

|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------|-----------|
|DATABASE_URL|Y||Database URL|
