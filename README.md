# SmartWeighing
DTx SmartWeighing 

[goQuorum](#goQuorum)

[Data Science](#Data Science)

## goQuorum

1. run ./setup
  This script runs the following steps:
  1.1. Install dependencies
  1.2. Create and save cryptographyc keys
  1.3. Import and configure Quorum Network
  1.4. Compile Smart Contract
2. docker-compose -f docker-compose.system.yml up --build -d
  2.1. Deploy the weighing tickets and authentication microservices
3. test with postman collections

SW-Auth API
The requests in the customer folder need a bearer token from an user with an admin role.
The requests in the user and stations folder require a bearer token with a costumer role.
SW-Ticket API
The requests in this folder require a bearer token from a station user.
![Collection](https://user-images.githubusercontent.com/77673690/154709712-f06d1bdd-2bea-4e59-8064-b58b56c0c452.png)

In the body of the authorize request the email and password needs to be selected with the user (costumer or admin) credentials
The response of the request contains an accessToken and a refreshToken.
The refreshToken can be used on the refresh request when the accessToken is not valid anymore.
The accessToken should be used as a bearer token for authentication on all other request.
![Authorize](https://user-images.githubusercontent.com/77673690/154719091-22e47aa0-6410-4b95-9633-63ed08950b42.png)

In the following image is explained how to use the bearerToken.
In the type field the bearerToken option should be selected.
In the token field the accessToken should be pasted.
![Bearer Token](https://user-images.githubusercontent.com/77673690/154719050-ad8e0209-5eb9-40de-87e7-81fce04ea220.png)




## Data Science

Folder with data science notebooks and datasets
