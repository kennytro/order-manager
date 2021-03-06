# order-manager
Single page web application that manages order, invoice, statement, etc. The application uses Angular for front-end, loopback for back-end, PostgreSQL for database, Auth0 for user authentication, AWS S3 for file storage and Redis for inter-process communication. 

See [this page](https://github.com/kennytro/order-manager/blob/master/docs/config.md) for server configuration.

#### Screenshots:
Dashboard with key business metrics.
![dashboard screenshot](docs/images/screenshot-dashboard.JPG "Dashboard")

Order detail with total amounts.
![order detail screenshot](docs/images/screenshot-order-detail.JPG "Order detail")

Invoice PDF file.
![invoice screenshot](docs/images/screenshot-invoice.JPG "Invoice")


#### [Live Demo](https://demo.ijumun.com):
Use the following user credential to login.
- client user: user id(`demoClient@etr.com`), password(`D3moClient`)
- admin user: user id(`demoAdmin@etr.com`),  password(`D3moAdmin`)

##### Note:
Because Heroku(Cloud platform provider) puts idle application to sleep in free plan, initial loading may take a while.
