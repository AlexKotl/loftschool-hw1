const fs = require('fs');
const path = require('path');
const util = require('util');

var config = {
  sourceDir: process.argv[2] || 'sample',
  destDir: process.argv[3] || 'ordered',
  deleteSource: process.argv.indexOf('-d') !== -1
};

copyFile = util.promisify(fs.copyFile);
readdir = util.promisify(fs.readdir);
exists = util.promisify(fs.exists);
mkdir = util.promisify(fs.mkdir);
unlink = util.promisify(fs.unlink);

processDir = async (dir) => {
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
      const folderExists = await exists(path.join(__dirname, config.destDir, letter));
      if (!folderExists) {
        try {
          await mkdir(path.join(__dirname, config.destDir, letter));
        }
        catch (error) {
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
}

console.log('Ordering files from ', config.sourceDir, 'into', config.destDir, '. Will remove source folder:', config.deleteSource);

const app = async () => {
  const isExists = await exists(config.destDir);
  if (!isExists) {
    await mkdir(config.destDir);
  }
  
  const sourceFolderExists = await exists(config.sourceDir);
  if (!sourceFolderExists) {
    console.log('No such source folder: ', config.sourceDir);
    process.exit(1);
  } 

  await processDir(config.sourceDir);
};
app();

console.log('Processing files done.');
