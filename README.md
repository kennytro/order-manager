# order-manager
Single web application that manages order, invoice, statement, etc. The application uses Angular for front-end, loopback for back-end, PostgreSQL for database and Redis for inter-process communication. 

## Environment Variables
|NAME|REQUIRED?|DEFAULT|DESCRIPTION|
|----|---------|-------:|-----------|
|DATABASE_URL|Yes|null|Postgres database URL|
|REDIS_URL|Yes|null|Redis URL. Used for inter-process communication to update metric data in batch|
