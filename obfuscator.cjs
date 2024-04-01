const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const r = (...args) => path.resolve(__dirname, ...args);

const obfuscatorOptions = {
  optionsPreset: 'low-obfuscation', // high-obfuscation
  // disableConsoleOutput: true,
  debugProtection: true,
  debugProtectionInterval: 200,
  selfDefending: true,
  // renameGlobals: true,
  unicodeEscapeSequence: true,
  domainLock: ['hpjy-1253419200.cos-website.ap-nanjing.myqcloud.com'],
  domainLockRedirectUrl: 'https://www.baidu.com',
};


// 加密整个extension文件夹里面所有的js文件，包括其他文件夹里面的js文件
const obfuscateFolder = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  const obfuscateFile = (filePath, options) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      fileContent,
      options || obfuscatorOptions,
    );
    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf8');
    console.log('Obfuscation of file %s is done!', filePath);
  };

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      if (filePath.includes('midas')) {
      } else {
        obfuscateFolder(filePath);
      }
    } else if (file.endsWith('.js')) {
      obfuscateFile(filePath);
    }
  });
};

obfuscateFolder(r('dist'));
