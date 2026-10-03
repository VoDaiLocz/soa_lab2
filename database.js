const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'soa_lab2.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối SQLite:', err.message);
  } else {
    console.log('Đã kết nối thành công tới SQLite CSDL: soa_lab2.db');
  }
});

// Khởi tạo bảng User theo đúng phụ lục đề bài
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS User (
      IdUser INTEGER PRIMARY KEY AUTOINCREMENT,
      UserName VARCHAR(255) NOT NULL UNIQUE,
      Password VARCHAR(255) NOT NULL,
      Token VARCHAR(255)
    )
  `, (err) => {
    if (err) {
      console.error('Lỗi khi tạo bảng User:', err.message);
      return;
    }

    // Seed tài khoản mẫu ban đầu nếu bảng còn trống
    db.get('SELECT COUNT(*) as count FROM User', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO User (UserName, Password, Token) VALUES (?, ?, ?)');
        
        // Mật khẩu mẫu lưu ở dạng thuần và có thể so khớp với MD5/Base64 từ client
        stmt.run('admin', 'admin123', null);
        stmt.run('student', '123456', null);
        stmt.run('user@example.com', 'password123', null);
        stmt.finalize();
        console.log('Đã nạp sẵn tài khoản mẫu: admin / admin123, student / 123456');
      }
    });
  });
});

// Các hàm truy vấn Promise-based
function findUserByUserName(userName) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM User WHERE UserName = ?', [userName], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function findUserById(idUser) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM User WHERE IdUser = ?', [idUser], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function updateUserToken(idUser, token) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE User SET Token = ? WHERE IdUser = ?', [token, idUser], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

module.exports = {
  db,
  findUserByUserName,
  findUserById,
  updateUserToken
};
