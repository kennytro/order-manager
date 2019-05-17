# order-manager
Single page web application that manages order, invoice, statement, etc. The application uses Angular for front-end, loopback for back-end, PostgreSQL for database, Auth0 for user authentication, AWS S3 for file storage and Redis for inter-process communication. 

See [this page](https://github.com/kennytro/order-manager/blob/master/docs/config.md) for server configuration.

#### Screenshots:
Dashboard with key business metrics.
![dashboard screenshot](https://github.com/kennytro/order-manager/tree/master/docs/images/screenshot-dashboard.jpg "Dashboard")

Order detail with total amounts.
![dashboard screenshot](https://github.com/kennytro/order-manager/tree/master/docs/images/screenshot-order-detail.jpg "Order detail")

Invoice PDF file.
![dashboard screenshot](https://github.com/kennytro/order-manager/tree/master/docs/images/screenshot-invoice.jpg "Invoice")


#### [Live Demo](https://etr-order-manager-staging.herokuapp.com/):
Use the following user credential to login.
- client user: user id(`demoClient@etr.com`), password(`D3moClient`)
- admin user: user id(`demoAdmin@etr.com`),  password(`D3moAdmin`)

##### Note:
Because Heroku(Cloud platform provider) puts idle application to sleep in free plan, initial loading may take a while.

