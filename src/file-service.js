import { readFileSync, unlinkSync } from 'fs';
import logger from './log';

const files = {};

const result = (status, data) => ({
  status,
  data: data || {},
});

const exists = filename => !!files[filename];
const size = filename => files[filename].size;
const read = filename => (
  files[filename].buffer ||
  readFileSync(files[filename].filepath)
);
const remove = (filename) => {
  const file = files[filename];
  if (file.filepath) {
    unlinkSync(file.filepath);
  }
  delete files[filename];
  logger.debug('File removed', filename);
};
const write = (filename, buffer, filesize, filepath) => {
  files[filename] = {
    age: new Date().getTime(),
    buffer,
    filepath,
    size: (buffer ? buffer.length : filesize),
  };
  logger.debug('File saved', files[filename]);
};

export const getFileSize = (filename) => {
  if (exists(filename)) {
    const fileSize = size(filename);
    logger.debug('Request size of', filename, 'is', fileSize);
    return result(200, { fileSize });
  }
  logger.debug('Request size of', filename, 'not found');
  return result(404);
};

export const readFile = (filename) => {
  if (exists(filename)) {
    logger.debug('Streaming', filename);
    return result(200, read(filename));
  }
  logger.debug('Streaming', filename, 'not found');
  return result(404);
};

export const writeFile = (file) => {
  logger.debug('Storing', file.originalname);
  write(file.originalname, file.buffer, file.size, file.path);
  return result(200);
};
export const writeFileChunk = (filename, buffer, chunkNumber) => {
  logger.debug('Storing', filename, 'chunk', chunkNumber);
  write(`${filename}.${chunkNumber}.chunk`, buffer);
  return result(200);
};
export const assembleFileChunks = (filename, requestTotalSize) => {
  logger.debug('Assembling', filename, 'total size', requestTotalSize);
  let chunkNumber = 1;
  let totalSize = 0;
  while (true) {
    const chunkName = `${filename}.${chunkNumber}.chunk`;
    if (exists(chunkName)) {
      const fileSize = size(chunkName);
      logger.debug('Testing', chunkName, 'with size', fileSize);
      chunkNumber += 1;
      totalSize += fileSize;
    } else {
      logger.error('Testing', chunkName, 'not found');
      break;
    }
  }
  if (requestTotalSize !== totalSize) {
    logger.error('Request total size', requestTotalSize, 'not equal to calculated total size', totalSize);
    return result(412);
  }
  logger.debug('Request total size', requestTotalSize, 'equal to calculated total size', totalSize);
  let buffer = null;
  chunkNumber = 1;
  while (true) {
    const chunkNameX = `${filename}.${chunkNumber}.chunk`;
    if (!exists(chunkNameX)) { break; }
    buffer = buffer ?
      Buffer.concat([buffer, read(chunkNameX)]) :
      read(chunkNameX);
    remove(chunkNameX);
    chunkNumber += 1;
  }
  write(filename, buffer);
  return result(200);
};

export const removeFile = (filename) => {
  if (exists(filename)) {
    logger.debug('Removing file', filename);
    remove(filename);
    return result(200);
  }
  logger.error('Removing', filename, 'not found');
  return result(404);
};
