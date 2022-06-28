const {execFileSync} = require('child_process');
const ect = require('ect-bin');
const fs = require('fs');
const path = require('path');
const pathToZipFolder = path.join(__dirname, 'dist', 'super-minified');

try {
  fs.unlinkSync(path.join(pathToZipFolder, 'index.zip'));
} catch(e){

}

try {
  const directoryEntries = fs.readdirSync(pathToZipFolder);
  const filenamesToZip = directoryEntries.filter(entry => entry !== 'index');
  const zipUs = filenamesToZip.map(filename => path.join(pathToZipFolder, filename));
  const args = [`${pathToZipFolder}/index.zip`, '-strip', '-zip', '-10009', ...zipUs];
  execFileSync(ect, args);
  const stats = fs.statSync('./dist/super-minified/index.zip');
  console.log('ZIP size', stats.size);
} catch (err) {
  console.log('ECT error', err);
}
