const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Khởi tạo CSDL SQLite (bảng User và seed data)
require('./database');

const authRoutes = require('./routes/authRoutes');
const helloRoutes = require('./routes/helloRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Các middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tích hợp Swagger UI để kiểm tra trực quan token và API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gắn các Router dịch vụ
// 1. Router xác thực (/login, /auth)
app.use('/', authRoutes);

// 2. Router API Hello World có bảo vệ bằng JWT Middleware (GET /)
app.use('/', helloRoutes);

// Middleware xử lý 404 cho các route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.url} không tồn tại trên hệ thống.`
  });
});

// Khởi động server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SOA Lab 2 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📖 Tài liệu Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`🔑 Dịch vụ đăng nhập: POST http://localhost:${PORT}/login`);
    console.log(`🛡️  Dịch vụ xác thực: GET http://localhost:${PORT}/auth`);
    console.log(`🌐 API Hello World (Cần Token): GET http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });
}

module.exports = app;
