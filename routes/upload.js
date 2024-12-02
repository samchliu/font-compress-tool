//TODO:
// 1. multiple fonts
// 2. load source fonts from remote

var express = require('express');
var fontSpider = require('font-spider');
var fs = require('fs');
var path = require('path');

var router = express.Router();

// 處理 POST 請求
router.post('/', function (req, res, next) {
  const { font, chars } = req.body;

  const copyFrom = path.join(process.cwd(), 'public/fonts', font);
  const copyTo = path.join(process.cwd(), 'compressed-fonts', font);
  fs.copyFile(copyFrom, copyTo, (err) => {
    if (err) {
      console.error('檔案移動失敗:', err);
    } else {
      console.log('檔案已成功移動');
    }
  });

  const regex = /\.(ttf|otf|woff|woff2|eot|svg|ttc|fon|fnt)$/;
  const fontFamily = font.replace(regex, '');
  const htmlContent = `
    <html>
      <head>
        <style>
          @font-face {
            font-family: '${fontFamily}';
            src: url('./${font}');
            font-weight: 400;
            font-style: normal;
          }
          body {
            font-family: '${fontFamily}';
          }
        </style>
      </head>
      <body>${chars}</body>
    </html>
  `;

  // 儲存 HTML 文件
  const htmlFilePath = path.join(process.cwd(), 'compressed-fonts/index.html');
  fs.writeFileSync(htmlFilePath, htmlContent);

  fontSpider
    .spider([htmlFilePath], {
      silent: false,
      backup: false,
    })
    .then(function (webFonts) {
      return fontSpider.compressor(webFonts, { backup: true });
    })
    .then(function (webFonts) {
      console.log(webFonts);
    })
    .then(() => {
      const outputPath = path.join(process.cwd(), `compressed-fonts/${font}`);
      console.log(outputPath);

      res.download(outputPath, font, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error compressing fonts');
        } else {
          // fs.unlinkSync(htmlFilePath);
        }
      });
    })
    .catch(function (errors) {
      console.error(errors);
      res.status(500).send('Error compressing fonts');
    });
});

module.exports = router;
