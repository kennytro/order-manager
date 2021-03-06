# Client Configuration
## Custom Logo
Replace 'client/src/favicon.ico' to use a custom logo instead of default logo.

*** 
# Auth0 Configuration
## Connections
Use 'Username-Password-Authentication' connection type. 
Toggle 'Disable Sing Ups' since we only allow invited users.

## Applications
Create two applications, one for 'SINGLE PAGE APPLICATION' type and another one for 'MACHINE TO MACHINE' type. SPA type application authorizes front end application, and MTM type application authrozies back end server. SPA app settings are set in environment variables which back end server provides to front end app. MTM app settings are used by back end server to initialize Auth0 environment.

For the SPA application, disable social connection such as google.

For the MTM application, you need to select the following scopes for the API assigned to it:
 - read/update/delete/create:users
 - read/update/delete/create:rules
 - read:logs

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
# AWS Configuration
## S3
Create two buckets, _om-public_ and _om-private_. Make _om-public_ publicly available because we save image files for static web pages. Turn on all "Public access settings" of _om-private_ to block any ACL and policy that allows public access.

When an image file is saved in S3, the back-end pre-signs an object for the image file, and the front-end uploads the actual image to S3. CORS configuration must allow the front-end to access S3 with the following:
```XML
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>http://myapp.example.com:3000</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
</CORSRule>
</CORSConfiguration>
```
You need to add additional CORSRule if multiple URLs access the same S3 bucket.

## IAM
Create a group for application servers. You should create a user for each tenant(e.g. dev-app, stage-app, prod-app, etc.) in the group. The IAM user name and credential must be assigned to environment variables in each environment:

|IAM Property|Environment Variable|Note|
|---|---|---|
|User name|TENANT_ID|Specifies folder name in each S3 bucket|
|Access Key ID|AWS_ACCESS_KEY_ID|Allows AWS SDK to access S3 buckets|
|Secret Key|AWS_SECRET_ACCESS_KEY|Allows AWS SDK to access S3 buckets|

In order to restrict an IAM user to access other IAM user's private folder, assign the following policy to the user group:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowGroupToSeeBucketListInTheConsole",
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:GetBucketLocation"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::*"
            ]
        },
        {
            "Sid": "AllowRootListingOfPrivateBucket",
            "Action": [
                "s3:ListBucket"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::om-private"
            ],
            "Condition": {
                "StringEquals": {
                    "s3:prefix": [
                        ""
                    ],
                    "s3:delimiter": [
                        "/"
                    ]
                }
            }
        },
        {
            "Sid": "AllowListingOfUserFolder",
            "Action": [
                "s3:ListBucket"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::om-private"
            ],
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "${aws:username}/*",
                        "${aws:username}"
                    ]
                }
            }
        },
        {
            "Sid": "AllowAllS3ActionsInUserFolder",
            "Action": [
                "s3:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::om-private/${aws:username}/*"
            ]
        },
        {
            "Sid": "AllowAllS3ActionsInPublicFolder",
            "Action": [
                "s3:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::om-public/*"
            ]
        }
    ]
}
``` 
***
# Redis Configuration on Heroku
Redis provided by Heroku has default idel 'timeout' set to 5 minutes. To prevent connection lose, run the following command to set 'timeout' to indefinite. 
```
heroku redis:timeout <app name> --seconds 0
```

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
|DEFAULT_PW|Y||Password of newly created user. This is a temporary password because new user receives email with a link to reset password.|

When back end server starts up for the first time, it needs to create an administrator user so that administrator user can login to finish initialization tasks via front end application. For creation of administrator user, the following environment variables are required - AUTH0_API_CLIENT_ID, AUTH0_API_CLIENT_SECRET, ADMIN_EMAIL and ADMIN_PW -, and they are not required once the administrator user is created.

## AWS settings
|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------:|-----------|
|TENANT_ID|Y||Namespace of S3 buckets|
|AWS_ACCESS_KEY_ID|Y||IAM user's access key(found under Users-><tenant id>->Security credentials)|
|AWS_SECRET_ACCESS_KEY|Y||IAM user's access secret|

## Google service settings
### ReCAPTCHA
The "Contact Us" page in the public module of client has a checkbox widget that detects if end-user is a real human or a bot. The widget requires 2 environment variables in the back-end.

### Google Map
The "Delivery Routes" page contains a component that renders Google map with markers representing clients. There are two API keys in order to use Google map - Geocoding API key(for translating street address to geo coordinates) and map API key(for getting map rendered in our page)

Through 'Google Cloud Platform' dashboard, the map API key should be restricted to only allowed in HTTP referers with certain domain.

Make sure the project that has API keys is linked to a billing account, otherwise you will get "timeout" error when calling the APIs.

|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------:|-----------|
|RECAPTCHA_SITE_KEY|Y||ReCAPTCHA site key to enable bot detection on 'Contact Us' page.|
|RECAPTCHA_SECRET|Y||ReCAPTCHA secret for verifying user response.|
|GOOGLE_GEOCODE_API_KEY|Y||Google Geocoding API key. When a resource with address(e.g. Client) is updated in the back-end, its street address is sent to Google using this key. In return, the location's coordinates are saved in DB|
|GOOGLE_MAP_API_KEY|Y||The API key to use in 'angular-google-maps' package.|


## Resource settings

|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------|-----------|
|DATABASE_URL|Y||Database URL|
|REDIS_URL|Y||Redis URL. Redis is used for inter-process communication.|

### Seed data
For minimal functionality, you may want to seed data into the following tables(See database/seed_data.sql for suggestion):
- public_page_element: Content of public Angular module.
- delivery_route: Default entry 'Pick Up'.
- company_info: Company profile used in PDF generation such as invoice and statement.
