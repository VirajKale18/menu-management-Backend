# Instructions

# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|MONGODB_URL          | connection url of the database  | -        |
|PORT                 | port to run the project         | 8080     |
|CLOUDINARY_API_KEY   | cloudinary secret key           | -        |
|CLOUDINARY_API_SECRET| cloudinary secret key           | -        |
|CLOUDINARY_API_NAME  | cloudinary cloud name           | -        |


# Getting started
- Clone the repository
```
git clone  <git menu-management-backend url>
```
- Install dependencies
```
cd <project_name>
npm install
```
- Build and run the project
```
node .
```
  Navigate to `http://localhost:8000`

## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules**         | Contains all  npm dependencies                                                                |
| **src**                  | Contains generic functions which are used repeatedly                                          |
| **src/utils**            | Application configuration including environment-specific configs                              |
| **src/controllers**      | Controllers define functions to serve various express routes.                                 |
| **src/db**               | Function to connect the MongoDB Database                                                      |
| **src/middlewares**      | Express middlewares which process the incoming requests before handling them down to the routes
| **src/routes**           | Contain all express routes, separated by module/area of application                           |
| **src/models**           | Models define schemas that will be used in storing and retrieving data from Application database |
| **src**/index.js         | Entry point to express app                                                                    |
| **src**/app.js           | Express app configurations and setting                                                        |
| package.json             | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)|
