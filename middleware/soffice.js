'use strict';

// file
const fs = require('fs');
// path
const path = require('path');
// child
const childProcess = require('child_process');
// tmp
// e.g. /tmp/tmp-xxxx.doc -> /app/tmp-xxxx.jpg
const tmp = require('tmp');

// clean up
tmp.setGracefulCleanup();

// 1. context is user input
// 2. next is the callback
module.exports = (context, next) => {
  if (context.input.type == 'audio' || context.input.type == 'video') {
    return next();
  }

  // e.g. /tmp/tmp-1Ul5PLSfZ8HOi.doc
  const source = tmp.tmpNameSync({
    // e.g. .doc
    postfix: path.extname(context.input.filename),
  });

  // e.g. tmp-1Ul5PLSfZ8HOi.jpg
  const destination =
    // only get the basename
    path.basename(source, path.extname(context.input.filename)) +
    '.' +
    context.input.format; // e.g. jpg

  //test
  console.log('source', source, 'destination', destination);

  // e.g. source: /tmp/tmp-1Ul5PLSfZ8HOi.doc
  // e.g. buffer: file content
  // source now in file system
  fs.writeFileSync(source, context.input.buffer);

  const process = childProcess.spawn('soffice', [
    '--headless',
    '--convert-to',
    context.input.format, // e.g. jpg
    source, // file in file system
  ]);

  process.stdout.on('data', data => console.log(data.toString()));
  process.stderr.on('data', data => console.log(data.toString()));

  process.on('close', () => {
    fs.readFile(destination, (err, data) => {
      if (err) {
        context.error = err;
      } else {
        context.output = {
          buffer: data,
        };
        fs.unlinkSync(destination);
      }
      fs.unlinkSync(source);
      next();
    });
  });
};
