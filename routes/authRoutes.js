const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { findUserByUserName, updateUserToken } = require('../database');
const { verifyTokenMiddleware, JWT_SECRET } = require('../middlewares/authMiddleware');

// Hàm kiểm tra mật khẩu linh hoạt: hỗ trợ cả Plain text, MD5 và Base64
function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;

  // 1. So khớp trực tiếp chuỗi
  if (inputPassword === storedPassword) return true;

  // 2. Kiểm tra nếu client gửi mã hash MD5 của mật khẩu
  const md5Hash = crypto.createHash('md5').update(storedPassword).digest('hex');
  if (inputPassword.toLowerCase() === md5Hash.toLowerCase()) return true;

  // 3. Kiểm tra nếu client gửi chuỗi Base64
  try {
    const decodedBase64 = Buffer.from(inputPassword, 'base64').toString('utf-8');
    if (decodedBase64 === storedPassword) return true;
  } catch (e) {}

  return false;
}

// Xử lý logic đăng nhập
async function handleLogin(req, res) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ userName và password.'
      });
    }

    // Tìm người dùng trong CSDL
    const user = await findUserByUserName(userName);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại.'
      });
    }

    // Kiểm tra mật khẩu (hỗ trợ cả plain text, MD5 và Base64)
    const isMatch = verifyPassword(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác.'
      });
    }

    // Sinh JWT Token (thời hạn 24 giờ)
    const payload = {
      idUser: user.IdUser,
      userName: user.UserName
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Lưu token vào CSDL bảng User theo đúng phụ lục đề bài
    await updateUserToken(user.IdUser, token);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        idUser: user.IdUser,
        userName: user.UserName
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi máy chủ nội bộ.',
      error: error.message
    });
  }
}

/**
 * @route POST /login và POST /
 * @desc  Dịch vụ đăng nhập, kiểm tra tài khoản/mật khẩu, sinh JWT và lưu vào bảng User
 */
router.post('/login', handleLogin);
router.post('/', handleLogin);

/**
 * @route GET /auth
 * @desc  API xác thực token localhost:PORT/auth
 */
router.get('/auth', verifyTokenMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token hợp lệ và còn hiệu lực.',
    valid: true,
    user: req.user
  });
});

/**
 * @route POST /auth
 * @desc  Hỗ trợ xác thực token gửi qua body JSON { "token": "..." }
 */
router.post('/auth', (req, res) => {
  const token = req.body.token || req.headers['authorization'];
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp token trong body hoặc header.'
    });
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token;

  try {
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: 'Token hợp lệ và còn hiệu lực.',
      valid: true,
      user: decoded
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
      valid: false,
      error: err.message
    });
  }
});

module.exports = router;
