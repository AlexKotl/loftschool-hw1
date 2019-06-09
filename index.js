const fs = require('fs');
const path = require('path');

var config = {
  sourceDir: process.argv[2] || 'sample',
  destDir: process.argv[3] || 'ordered',
  deleteSource: process.argv.indexOf('-d') !== -1
};

function processDir (dir) {
  fs.readdirSync(path.join(__dirname, dir), { withFileTypes: true }).forEach(function (file) {
    if (file.isDirectory()) {
      processDir(path.join(dir, file.name));
    } else {
      let letter = file.name[0].toUpperCase();
      if (!letter.match(/([A-Z])/)) {
        letter = 'other';
      }

      // create letter dir
      if (!fs.existsSync(path.join(__dirname, config.destDir, letter))) {
        fs.mkdirSync(path.join(__dirname, config.destDir, letter));
      }

      fs.copyFileSync(path.join(__dirname, dir, file.name), path.join(__dirname, config.destDir, letter, file.name));

      if (config.deleteSource) {
        fs.unlinkSync(path.join(__dirname, dir, file.name));
      }
    }
  });

  if (config.deleteSource) {
    fs.rmdirSync(path.join(__dirname, dir));
  }
}

if (!fs.existsSync(config.destDir)) {
  fs.mkdirSync(config.destDir);
}

if (!fs.existsSync(config.sourceDir)) {
  console.log('No such source folder: ', config.sourceDir);
  process.exit();
}

console.log('Ordering files from ', config.sourceDir, 'into', config.destDir, '. Will remove source folder:', config.deleteSource);

processDir(config.sourceDir);

console.log('Processing files done.');
