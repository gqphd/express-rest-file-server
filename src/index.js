import nodegetopt from 'node-getopt';
import server from './server';

const opt = nodegetopt.create([
  ['p', 'port=PORT', 'server port (default 5000)'],
  ['', 'chunknumber=CHUNKNUMBER', "chunk number parameter (default 'chunknumber')"],
  ['', 'totalsize=TOTALSIZE', "total size parameter (default 'totalsize')"],
  ['', 'storageType=TYPE', "disk or memory (default 'memory')"],
  ['', 'storagePath=PATH', "where to save files (default '/tmp')"],
]).bindHelp().parseSystem().options;

server.run({
  chunkNumber: opt.chunknumber,
  port: (opt.port || process.env.PORT || 5000),
  totalSize: opt.totalsize,
  storage: {
    type: opt.storageType,
    path: opt.storagePath,
  },
});
