const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const fileService = require('./file-service');
const logger = require('../log');

/* eslint-disable no-underscore-dangle */
const saveFile = (request, response, filename) => {
  logger.verbose('Saving file', request.file, filename);
  const result = fileService.writeFile(request.file);
  if (request.query._postmessage) {
    if (request.query._postmessageid) {
      result.data._postmessageid = request.query._postmessageid;
    }
    response
      .status(result.status)
      .header('Content-Type', 'text/html')
      .send(`<!DOCTYPE html><script>parent.postMessage(JSON.stringify(${JSON.stringify(result.data)}), '*');</script>`);
  } else {
    response.status(result.status).send(result.data);
  }
};
/* eslint-enable no-underscore-dangle  */

module.exports = {
  init(options) {
    let storage;
    if (options.storage.type === 'disk') {
      logger.info('Using disk storage', (options.storage.path || '/tmp'));

      if (options.storage.path && !fs.existsSync(options.storage.pathh)) {
        logger.error(options.storage.path, 'does not exist');
        throw new Error(`${options.storage.path} does not exist`);
      }

      storage = multer.diskStorage({
        destination(req, file, cb) {
          cb(null, (options.storage.path || '/tmp'));
        },
        filename(req, file, cb) {
          cb(null, (file.originalname || file.fieldname));
        },
      });
    } else {
      logger.info('Using memory storage');
      storage = multer.memoryStorage();
    }
    const upload = multer({ storage });

    const app = express();
    app.use(bodyParser.urlencoded({
      extended: true,
    }));
    app.use(bodyParser.json());
    app.use(cors());

    app.get('/files/:filename/size', (request, response) => {
      const result = fileService.getFileSize(request.params.filename);
      response.status(result.status).send(result.data);
    });

    app.get('/files/:filename', (request, response) => {
      const result = fileService.readFile(request.params.filename);
      response.status(result.status).send(result.data);
    });
    app.delete('/files/:filename', (request, response) => {
      const result = fileService.removeFile(request.params.filename);
      response.status(result.status);
    });

    app.post('/files', upload.single('file'), (request, response) => {
      saveFile(request, response, request.file.originalname);
    });

    app.post('/files/:filename', upload.single('file'), (request, response) => {
      saveFile(request, response, request.params.filename);
    });

    app.post('/chunk/:filename', upload.single('file'), (request, response) => {
      const result = fileService.writeFileChunk(
        request.params.filename,
        request.file.buffer,
        request.body[options.chunkNumber || 'chunknumber']
      );
      response.status(result.status).send(result.data);
    });

    app.post('/assemble/:filename', (request, response) => {
      const result = fileService.assembleFileChunks(
        request.params.filename,
        request.body[options.totalSize || 'totalsize']
      );
      response.status(result.status).send(result.data);
    });

    return app;
  },

  run(options) {
    logger.info('================================');
    logger.info('>>> Express REST file server <<<');
    logger.info('================================');
    const server = this.init(options);
    server.listen(options.port, () => {
      logger.info('Listening on', options.port);
    });
  },
};
