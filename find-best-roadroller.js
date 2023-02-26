const { exec } = require('node:child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cliToApiMaps = [
  { cli: '-Zab', api: 'numAbbreviations', type: 'number' },
  { cli: '-Zlr', api: 'recipLearningRate', type: 'number' },
  { cli: '-Zmc', api: 'modelMaxCount', type: 'number' },
  { cli: '-Zmd', api: 'modelRecipBaseCount', type: 'number' },
  { cli: '-Zpr', api: 'precision', type: 'number' },
  { cli: '-Zdy', api: 'dynamicModels', type: 'number' },
  { cli: '-Zco', api: 'contextBits', type: 'number' },
  { cli: '-S', api: 'sparseSelectors', type: 'array' }
]

rl.question('How many seconds should RoadRoller spend looking for the best config? ', seconds => {
  console.log('Building...');
  exec('vite build', () => {
    console.log(`Spending ${seconds} seconds searching for config...`);
    exec(`node node_modules/roadroller/cli.mjs ${__dirname}/dist/output.js -D -OO`, { timeout: seconds * 1000, killSignal: 'SIGINT', maxBuffer: 4069 * 1024 }, (error, stdout, stderr) => {
      const bestConfigJs = { allowFreeVars: true };
      const bestConfigConsole = stderr.split('\n').reverse().find(line => line.includes('<-'));
      const itemCheckRemoved = bestConfigConsole.split(') ')[1];
      const endSizeRemoved = itemCheckRemoved.split(': ')[0];
      const configPieces = endSizeRemoved.split(' ').filter(param => !param.startsWith('-Sx'));
      configPieces.forEach(singleParam => {
        cliToApiMaps.forEach(mapper => {
          if (singleParam.startsWith(mapper.cli) && mapper.type !== 'unused') {
            bestConfigJs[mapper.api] = convertValue(mapper, singleParam);
          }
        })
      });
      fs.writeFileSync(`${__dirname}/roadroller-config.json`, JSON.stringify(bestConfigJs, null, 2));
      console.log(`BEST CONFIG: ${bestConfigConsole}`);
      process.exit(0);
    });
  })
});

function convertValue(mapper, cliSetting) {
  const stringValue = cliSetting.replace(mapper.cli, '');
  if (mapper.type === 'number') {
    return parseInt(stringValue, 10);
  } else {
    return stringValue.split(',').map(value => parseInt(value, 10));
  }
}
