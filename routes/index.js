var express = require('express');
var fs = require('fs');
var path = require('path');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const directoryPath = path.join(process.cwd(), 'public/fonts');
  const fonts = getFilesInDirectory(directoryPath);
  res.render('index', { fonts });
});

module.exports = router;

function getFilesInDirectory(dirPath) {
  // 讀取目錄內容
  const items = fs.readdirSync(dirPath);

  // 過濾掉隱藏檔案和資料夾，只保留檔案
  return items.filter(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    return !item.startsWith('.') && stat.isFile(); // 不是隱藏檔案且是檔案
  });
}