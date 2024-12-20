const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const rootDir = path.join(__dirname, 'public');

app.use(express.static(rootDir));

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
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('<h1>File Not Found</h1>');
    }
  });
});

app.get('*', async (req, res) => {
  if (req.headers.origin === 'https://file-server.ijw.app') {
    return res.sendFile(path.join(rootDir, 'file', req.path), (err) => {
      if (err) {
        res.status(404).send('<h1>File Not Found</h1>');
      }
    });
  }

  let requestedPath = path.join(rootDir, req.path);

  try {
    const stats = fs.statSync(requestedPath);
    if (stats.isDirectory()) {
      const files = await getDirectoryList(requestedPath);
      let html = `<h1>Directory listing: ${req.path}</h1><ul>`;

      files.forEach(file => {
        const relativePath = path.relative(rootDir, file.path);
        if (file.isDirectory) {
          html += `<li><a href="/${relativePath}/">${file.name}/</a></li>`;
        } else {
          html += `<li><a href="/file/${relativePath}">${file.name}</a></li>`;
        }
      });

      html += `</ul>`;
      res.send(html);
    } else {
      // 여기서 파일을 직접 응답하는 부분을 변경합니다.
      res.redirect(`/file/${requestedPath}`);
    }
  } catch (error) {
    res.status(404).send(`<h1>404 Not Found</h1><code><pre>${error}</pre></code>`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
