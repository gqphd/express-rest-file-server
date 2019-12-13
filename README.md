# express-rest-file-server
[![Build Status](https://travis-ci.org/bitIO/express-rest-file-server.svg?branch=master)](https://travis-ci.org/bitIO/express-rest-file-server)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Version npm](https://img.shields.io/npm/v/express-rest-file-server.svg?style=flat-square)](https://www.npmjs.com/package/express-rest-file-server)
[![npm Downloads](https://img.shields.io/npm/dm/express-rest-file-server.svg?style=flat-square)](https://npmcharts.com/compare/express-rest-file-server?minimal=true)

[![NPM](https://nodei.co/npm/express-rest-file-server.png?downloads=true&downloadRank=true)](https://nodei.co/npm/express-rest-file-server/)

An express based application, inspired by [mock-file-server](https://github.com/betajs/mock-file-server), to be used as a CRUD file server storing content in the memory (temporal) or in the disk (permanent) of the server.

## Usage
You can either install it globally o locally to your project

```shell
# global installation
npm install -g express-rest-file-server
# local installation
npm install express-rest-file-server
```

To start using it with default options, just run

```shell
# global installation
express-rest-file-server
# local installation
npx express-rest-file-server
```

gq example
```
npx babel-node src/index.js --storageType=disk --storagePath=D:\\Tmp
```

### Options

* port: defaults to 5000
* storageType: can be `memory` or `disk` (defaults to memory)
* storagePath: where to store the files if storage is set to `disk` (defaults to `/tmp`)

## Routes

### POST /files

Uploads a file to the store with its original name

### POST /files/:filename

Uploads a file to the store with a custom name (:filename)

### POST /files/chunk/:filename

Uploads a chuck of a file to the store with a custom name (:filename)

### POST /files/assemble/:filename

_Builds_ a file from its chunks

### GET /files/

(new)Retrieve a file list

### GET /files/:filename

Retrieve a file by its name

### GET /files/:filename/size

Retrieve a file size by its name

### DELETE /files/:filename

Remove a file by its name
