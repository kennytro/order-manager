# order-manager
Single web application that manages order, invoice, statement, etc. The application has the following specs:
- Front-end : Angular(~7.2.0)
- Back-end: Loopback(^3.22.0)
- Database: postgres
- File server: AWS S3
- Authentication: Auth0(^2.14.0)

The application serves public content that is both static(static HTML tags) and dynamic(rendered by Angular engine), and secured content which requires user authentication.

## Environment Variables

NAME|REQUIRED?|DEFAULT|DESCRIPTION
----|---------|-------:|-----------
DATABASE_URL|Yes|null|Database URL
AUTH0_DOMAIN_ID|Y||Domain of the application in Auth0 acount
AUTH0_CLIENT_ID|Y||Client ID of the application in Auth0 account
AUTH0_CONNECTION|Y||Auth0 connection authentication type
AUTH0_AUDIENCE|Y||Auth0 API URL(e.g. https://<AUTH0_DOMAIN_ID>/api/v2/
AUTH0_API_CLIENT_ID|N||Client ID of the machine to machine type application. With AUTH0_API_CLIENT_SECRET, back end server initializes Auth0 environment such as creating default 'admin' user
AUTH0_API_CLIENT_SECRET|N||Client secret of the machine to machine type application. This varialbe is needed to initialize Auth0 environment.
ADMIN_EMAIL|N||Email of the default administrator user
ADMIN_PW|N||Password of the default administrator user
DEFAULT_PW|Y||Password of newly created user. This is a temporary password because new user receives email with a link to reset password.
