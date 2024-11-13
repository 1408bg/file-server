const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const rootDir = path.join(__dirname, 'public');

function getDirectoryList(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        return reject(err);
      }

      const fileList = files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(directoryPath, file.name),
      }));

      resolve(fileList);
    });
  });
}

app.get('/file/*', (req, res) => {
  const filePath = path.join(rootDir, req.params[0]);
  res.sendFile(filePath);
});

app.get('*', async (req, res) => {
  let requestedPath = path.join(rootDir, req.path);

  try {
    const stats = fs.statSync(requestedPath);
    if (stats.isDirectory()) {
      const files = await getDirectoryList(requestedPath);
      let html = `<h1>Directory listing: ${req.path}</h1><ul>`;
      
      files.forEach(file => {
        if (file.isDirectory()) {
          html += `<li><a href="${path.relative(rootDir, file.path)}">${file.name}/</a></li>`;
        } else {
          html += `<li><a href="/file/${path.relative(rootDir, file.path)}">${file.name}</a></li>`;
        }
      });
      
      html += `</ul>`;
      res.send(html);
    } else {
      res.sendFile(requestedPath);
    }
  } catch (error) {
    res.status(404).send('<h1>404 Not Found</h1>');
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
