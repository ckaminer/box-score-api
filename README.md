# Box Score API

This application is a REST API used to serve game data for the Barstool Sports Box Score challenge. The associated client application can be found [here](https://github.com/ckaminer/boxscore-client).

## Getting Started

These instructions will assist you in retrieving a copy of the project in order to get it up and running for development and/or testing purposes.

### Built On

- [Node 10.15.3](https://nodejs.org/download/release/v10.15.3/)
- [MongoDB shell version v4.0.9](https://docs.mongodb.com/manual/release-notes/4.0/)
- [Docker 18.03.1-ce](https://docs.docker.com/docker-for-mac/release-notes/#stable-releases-of-2018)
- [Docker Compose 1.21.1](https://docs.docker.com/release-notes/docker-compose/#1211)

### Installation

Clone repository:
```
git clone https://github.com/ckaminer/boxscore-api.git
```

### Running the Application

#### No Container

Note this documentation includes instructions for running this application with or without the use of Docker. If you'd like to run this in a container you can skip down to the section on running [just the api](#Using-Docker-Compose-api-only) in a container or the section on running the entire [full stack application](#using-docker-compose-full-stack-application) in a container.

Please ensure you have Node installed on your machine before following these instructions. A link to the download page for the Node version used during development can be found [above](#Built-On).

Before running the application, MongoDB must be installed and running in a separate shell. Homebrew installation and running instructions can be found [here](https://github.com/mongodb/homebrew-brew).

Once you have Mongo installed and you've selected a `dbpath` run the following command where `~/data/db` is your desired dbpath:
```
mongod --dbpath ~/data/db
```

With your Mongo instance up and running you can now open up a new shell and start getting the application ready to go.

In your terminal, set the port you wish to run the server on (optional - default is 8081):
```
export BS_API_PORT=8081
```

Additionally, if you opted to run your Mongo instance on something other than the default (27017), please set that value in your application shell:
```
export BS_MONGO_PORT=27017
```

Finally, if you are also running the client application and chose to run it on something besides the default port, please set the client port in your API application shell as well. This will help ensure that you do not run into any CORS issues.
```
export BS_CLIENT_PORT=8080
```

Retrieve dependencies (from the project root):
```
npm install
```

Start development server (from the project root):
```
npm run dev
```

Upon successful completion of the above steps, you should be able to access the endpoints listed below at `http://localhost:${BS_API_PORT}`

#### Using Docker Compose (API Only)

Before following these instructions please ensure that Docker and Docker Compose (comes out of the box with Mac installations of Docker) are installed on your machine. Node and MongoDB are not required for these instructions.

Execute startup command (from the project root):
```
docker-compose up web
```

Note that this will build the image locally for you when it is run for the first time. Subsequent executions of this command will not result in a rebuild. If you would like to rebuild the image you may do so with:
```
docker-compose up --build web
```

#### Using Docker Compose (Full Stack Application)

Before following these instructions please ensure that Docker and Docker Compose (comes out of the box with Mac installations of Docker) are installed on your machine. Node and MongoDB are not required for these instructions.

Additionally, please ensure that both the API and client applications are cloned into the same directory resulting in a file structure like so:
```
\directory-of-your-choice
  \boxscore-api
  \boxscore-web
```

Once both applications are cloned, you can start the entire application with the following startup command from the root of the API application:
```
docker-compose up
```

Note that this will build all images locally for you when it is run for the first time. Subsequent executions of this command will not result in a rebuild. If you would like to rebuild the images you may do so with:
```
docker-compose up --build
```

## Running the tests

Unit tests (from the project root):
```
npm run test
```

To run the acceptance tests, first start your server. Then in a new shell set your port environment variables and run (from the project root):
```
npm run acceptance
```

Lint (from the project root):
```
npm run lint
```

Entire suite (from the project root):
```
npm run suite
```

## Endpoints

#### View All Games
`GET /api/v1/games`

*Expected Response*: Array of all game objects

| Query Parameter | Accepted Values |
| -- | -- |
| league | MLB, NBA |

*Example*: `http://localhost:8081/api/v1/games?league=MLB`

#### View Single Game
`GET /api/v1/games/${src_id}`

*Expected Response*: Single game object

*Note*: Due to the nature of this project being a code challenge, there are only two game IDs that are being used. They can be seen below.

| League | Game ID |
| -- | -- |
| MLB | eed38457-db28-4658-ae4f-4d4d38e9e212 |
| NBA | 6c974274-4bfc-4af8-a9c4-8b926637ba74 |

*Example*: `http://localhost:8081/api/v1/games/eed38457-db28-4658-ae4f-4d4d38e9e212`
