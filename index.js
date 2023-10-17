const fs = require('fs');
const path = require('path');
const util = require('util');

var config = {
  sourceDir: process.argv[2] || 'sample',
  destDir: process.argv[3] || 'ordered',
  deleteSource: process.argv.indexOf('-d') !== -1
};

const copyFile = util.promisify(fs.copyFile);
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);

const processDir = async (dir) => {
  const dirContent = await readdir(path.join(__dirname, dir), { withFileTypes: true });
  dirContent.forEach(async function (file) {
    if (file.isDirectory()) {
      await processDir(path.join(dir, file.name));
    } else {
      let letter = file.name[0].toUpperCase();
      if (!letter.match(/([A-Z])/)) {
        letter = 'other';
      }

      // create letter dir
      try {
        await access(path.join(__dirname, config.destDir, letter));
      } catch (err) {
        try {
          await mkdir(path.join(__dirname, config.destDir, letter));
        } catch (error) {
          // skip error
        }
      }

      console.log(' - copying file', file.name);
      await copyFile(path.join(__dirname, dir, file.name), path.join(__dirname, config.destDir, letter, file.name));

      if (config.deleteSource) {
        await unlink(path.join(__dirname, dir, file.name));
      }
    }
  });

  if (config.deleteSource) {
    await rmdir(path.join(__dirname, dir));
  }
};

console.log('Ordering files from ', config.sourceDir, 'into', config.destDir, '. Will remove source folder:', config.deleteSource);

const app = async () => {
  try {
    const isExists = await access(config.destDir);
  } catch (err) {
    await mkdir(config.destDir);
  }

  try {
    await access(config.sourceDir);
  } catch (err) {
    console.log('No such source folder: ', config.sourceDir);
    process.exit(1);
  }

  await processDir(config.sourceDir);
};
app();

console.log('Processing files done.');
