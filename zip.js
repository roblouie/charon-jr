const {execFileSync} = require('child_process');
const ect = require('ect-bin');
const fs = require('fs');
const path = require('path');
const pathToZipFolder = path.join(__dirname, 'dist');

try {
  fs.unlinkSync(path.join(pathToZipFolder, 'super-minified', 'index.zip'));
} catch(e){

}

try {
  const directoryEntries = fs.readdirSync(pathToZipFolder);
  const filenamesToZip = directoryEntries.filter(entry => entry !== 'super-minified' && entry !== 'index.html');
  const zipUs = filenamesToZip.map(filename => path.join(pathToZipFolder, filename));
  const args = [`${pathToZipFolder}/super-minified/index.zip`, '-strip', '-zip', '-10009', ...zipUs, path.join(pathToZipFolder, 'super-minified', 'index.html')];
  execFileSync(ect, args);
  const stats = fs.statSync('./dist/super-minified/index.zip');
  console.log('ZIP size', stats.size);
} catch (err) {
  console.log('ECT error', err);
}
