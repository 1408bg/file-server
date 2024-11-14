const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const rootDir = path.join(__dirname, 'public'); // 'public' 디렉토리의 절대 경로

// 'public' 폴더를 정적 파일 경로로 설정
app.use(express.static(rootDir));

// 디렉토리 내 파일 목록을 가져오는 함수
function getDirectoryList(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        return reject(err);
      }

      const fileList = files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(directoryPath, file.name),  // 경로를 안전하게 결합
      }));

      resolve(fileList);
    });
  });
}

// 파일을 제공하는 엔드포인트
app.get('/file/*', (req, res) => {
  const filePath = path.join(rootDir, req.params[0]);  // 요청된 경로와 rootDir을 안전하게 결합
  console.log('File path:', filePath);  // 경로 확인
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(404).send('<h1>File Not Found</h1>');
    }
  });
});

// 디렉토리 목록을 제공하는 엔드포인트
app.get('*', async (req, res) => {
  let requestedPath = path.join(rootDir, req.path);  // 요청된 경로와 rootDir을 안전하게 결합
  console.log('Requested path:', requestedPath);  // 경로 확인

  try {
    const stats = fs.statSync(requestedPath);  // 파일이나 디렉토리 정보 확인
    if (stats.isDirectory()) {
      const files = await getDirectoryList(requestedPath);
      let html = `<h1>Directory listing: ${req.path}</h1><ul>`;

      files.forEach(file => {
        const relativePath = path.relative(rootDir, file.path);  // 'public' 디렉토리로부터 상대 경로 계산
        if (file.isDirectory) {
          html += `<li><a href="${relativePath}/">${file.name}/</a></li>`;
        } else {
          html += `<li><a href="/file/${relativePath}">${file.name}</a></li>`;
        }
      });

      html += `</ul>`;
      res.send(html);
    } else {
      res.sendFile(requestedPath);  // 파일이면 직접 반환
    }
  } catch (error) {
    console.log(error);
    res.status(404).send(`<h1>404 Not Found</h1><code><pre>${error}</pre></code>`);
  }
});

app.listen(port, () => {
  console.log(`port: ${port}`);
});
