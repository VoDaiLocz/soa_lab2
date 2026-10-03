const express = require('express');
const router = express.Router();
const { verifyTokenMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route GET /
 * @desc  API in dòng "Hello World" từ Bài thực hành số 1, nay được bảo mật bằng JWT Middleware
 */
router.get('/', verifyTokenMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Hello World',
    description: 'API bài thực hành số 1 đã được bảo vệ thành công bởi JWT Middleware bài 2',
    user: req.user
  });
});

/**
 * @route GET /hello
 * @desc  Đường dẫn phụ cho Hello World (đáp ứng cả 2 phong cách gọi)
 */
router.get('/hello', verifyTokenMiddleware, (req, res) => {
  return res.status(200).send('Hello World');
});

module.exports = router;
