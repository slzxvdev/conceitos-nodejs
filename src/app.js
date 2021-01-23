const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');
// const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const repositories = [];

function checkRepositoryId(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  };

  response.locals.repositoryIndex = repositoryIndex;

  return next();
};

function validateRepositoryId(request, response, next) {
  const { id } = request.params;
  
  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository id.'});
  };
  
  return next();
};

app.use('/repositories/:id', validateRepositoryId);
app.use('/repositories/:id', checkRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {

  const { title, url, techs } = request.body;
  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[response.locals.repositoryIndex].likes
  };

  repositories[response.locals.repositoryIndex] = repository;

  return response.json(repository);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  };

  repositories.splice(repositoryIndex, 1);

  return response.sendStatus(204);
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.'});
  };

  const likes = repositories[repositoryIndex].likes + 1;

  const repository = {
    id,
    title: repositories[repositoryIndex].title,
    url: repositories[repositoryIndex].url,
    techs: repositories[repositoryIndex].techs,
    likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);

});

module.exports = app;
