import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import multer, { diskStorage, memoryStorage } from 'multer';
import { urlencoded, json } from 'body-parser';
import { writeFile, getFileSize, readFile, removeFile, writeFileChunk, assembleFileChunks } from './file-service';
import { verbose, info, error } from '../log';

/* eslint-disable no-underscore-dangle */
const saveFile = (request, response, filename) => {
  verbose('Saving file', request.file, filename);
  const result = writeFile(request.file);
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

export default {
  init(options) {
    let storage;
    if (options.storage.type === 'disk') {
      info('Using disk storage', (options.storage.path || '/tmp'));

      if (options.storage.path && !existsSync(options.storage.pathh)) {
        error(options.storage.path, 'does not exist');
        throw new Error(`${options.storage.path} does not exist`);
      }

      storage = diskStorage({
        destination(req, file, cb) {
          cb(null, (options.storage.path || '/tmp'));
        },
        filename(req, file, cb) {
          cb(null, (file.originalname || file.fieldname));
        },
      });
    } else {
      info('Using memory storage');
      storage = memoryStorage();
    }
    const upload = multer({ storage });

    const app = express();
    app.use(urlencoded({
      extended: true,
    }));
    app.use(json());
    app.use(cors());

    app.get('/files/:filename/size', (request, response) => {
      const result = getFileSize(request.params.filename);
      response.status(result.status).send(result.data);
    });

    app.get('/files/:filename', (request, response) => {
      const result = readFile(request.params.filename);
      response.status(result.status).send(result.data);
    });
    app.delete('/files/:filename', (request, response) => {
      const result = removeFile(request.params.filename);
      response.status(result.status);
    });

    app.post('/files', upload.single('file'), (request, response) => {
      saveFile(request, response, request.file.originalname);
    });

    app.post('/files/:filename', upload.single('file'), (request, response) => {
      saveFile(request, response, request.params.filename);
    });

    app.post('/chunk/:filename', upload.single('file'), (request, response) => {
      const result = writeFileChunk(
        request.params.filename,
        request.file.buffer,
        request.body[options.chunkNumber || 'chunknumber']
      );
      response.status(result.status).send(result.data);
    });

    app.post('/assemble/:filename', (request, response) => {
      const result = assembleFileChunks(
        request.params.filename,
        request.body[options.totalSize || 'totalsize']
      );
      response.status(result.status).send(result.data);
    });

    return app;
  },

  run(options) {
    info('================================');
    info('>>> Express REST file server <<<');
    info('================================');
    const server = this.init(options);
    server.listen(options.port, () => {
      info('Listening on', options.port);
    });
  },
};

