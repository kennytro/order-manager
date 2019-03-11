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
