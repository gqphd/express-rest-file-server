# express-rest-file-server
![travis-ci](https://travis-ci.org/bitIO/express-rest-file-server.svg?branch=master)

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

### Options

* port: defaults to 5000
* storageType: can be `memory` or `disk` (defaults to memory)
* storagePath: where to store the files if storage is set to `disk` (defaults to `/tmp`)

