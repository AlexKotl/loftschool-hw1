const fs = require('fs');
const path = require('path');

var config = {
    sourceDir: 'sample',
    destDir: 'ordered',
}

function processDir(dir) {
    fs.readdirSync(path.join(__dirname, dir), {withFileTypes: true}).forEach(function(file) {
        if (file.isDirectory()) {
            processDir(path.join(dir, file.name));
        }
        else {
            let letter = file.name[0].toUpperCase();
            if (!letter.match(/([A-Z])/)) {
                letter = 'other';
            }
            
            // create letter dir
            if (!fs.existsSync(path.join(__dirname, config.destDir, letter))) {
                fs.mkdirSync(path.join(__dirname, config.destDir, letter));
            }
            
            fs.copyFileSync(path.join(__dirname, dir, file.name), path.join(__dirname, config.destDir, letter, file.name));
        }
    });
}

if (!fs.existsSync(config.destDir)) {
    fs.mkdirSync(config.destDir);
}

processDir(config.sourceDir);


