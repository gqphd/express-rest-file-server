import { readFileSync, unlinkSync } from 'fs';
import { debug, error } from './log';

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
  debug('File removed', filename);
};
const write = (filename, buffer, filesize, filepath) => {
  files[filename] = {
    age: new Date().getTime(),
    buffer,
    filepath,
    size: (buffer ? buffer.length : filesize),
  };
  debug('File saved', files[filename]);
};

const getFileSize = (filename) => {
  if (exists(filename)) {
    const fileSize = size(filename);
    debug('Request size of', filename, 'is', fileSize);
    return result(200, { fileSize });
  }
  debug('Request size of', filename, 'not found');
  return result(404);
};

const readFile = (filename) => {
  if (exists(filename)) {
    debug('Streaming', filename);
    return result(200, read(filename));
  }
  debug('Streaming', filename, 'not found');
  return result(404);
};

const writeFile = (file) => {
  debug('Storing', file.originalname);
  write(file.originalname, file.buffer, file.size, file.path);
  return result(200);
};
const writeFileChunk = (filename, buffer, chunkNumber) => {
  debug('Storing', filename, 'chunk', chunkNumber);
  write(`${filename}.${chunkNumber}.chunk`, buffer);
  return result(200);
};
const assembleFileChunks = (filename, requestTotalSize) => {
  debug('Assembling', filename, 'total size', requestTotalSize);
  let chunkNumber = 1;
  let totalSize = 0;
  while (true) {
    const chunkName = `${filename}.${chunkNumber}.chunk`;
    if (exists(chunkName)) {
      const fileSize = size(chunkName);
      debug('Testing', chunkName, 'with size', fileSize);
      chunkNumber += 1;
      totalSize += fileSize;
    } else {
      error('Testing', chunkName, 'not found');
      break;
    }
  }
  if (requestTotalSize !== totalSize) {
    error('Request total size', requestTotalSize, 'not equal to calculated total size', totalSize);
    return result(412);
  }
  debug('Request total size', requestTotalSize, 'equal to calculated total size', totalSize);
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

const removeFile = (filename) => {
  if (exists(filename)) {
    debug('Removing file', filename);
    remove(filename);
    return result(200);
  }
  error('Removing', filename, 'not found');
  return result(404);
};

export default {
  assembleFileChunks,
  getFileSize,
  readFile,
  removeFile,
  writeFile,
  writeFileChunk,
};
