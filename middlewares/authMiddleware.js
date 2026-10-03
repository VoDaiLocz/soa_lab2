const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'soa_lab2_jwt_secret_key_2026';

function verifyTokenMiddleware(req, res, next) {
  // Trích xuất token từ Authorization header hoặc custom header
  let token = req.headers['authorization'] || req.headers['x-access-token'] || req.headers['token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối. Token không được cung cấp.'
    });
  }

  // Nếu header có tiền tố Bearer thì cắt bỏ
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
      error: error.message
    });
  }
}

module.exports = {
  verifyTokenMiddleware,
  JWT_SECRET
};
