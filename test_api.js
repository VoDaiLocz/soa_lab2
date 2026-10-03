const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG SOA LAB 2 ---');
  let token = '';

  // Test 1: Gọi GET / khi CHƯA có token
  try {
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log('Test 1 (GET / không có token) -> Status:', res1.status, res1.body.message);
    if (res1.status === 401) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 1 lỗi kết nối:', err.message);
  }

  // Test 2: Đăng nhập sai mật khẩu
  try {
    const res2 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { userName: 'admin', password: 'sai_mat_khau' });
    console.log('Test 2 (Sai mật khẩu) -> Status:', res2.status, res2.body.message);
    if (res2.status === 401) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 2 lỗi:', err.message);
  }

  // Test 3: Đăng nhập đúng mật khẩu
  try {
    const res3 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { userName: 'admin', password: 'admin123' });
    console.log('Test 3 (Đăng nhập đúng) -> Status:', res3.status, 'Token prefix:', res3.body.token ? res3.body.token.slice(0, 20) + '...' : 'none');
    token = res3.body.token;
    if (res3.status === 200 && token) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 3 lỗi:', err.message);
  }

  // Test 4: Xác thực token GET /auth
  try {
    const res4 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/auth',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Test 4 (Xác thực GET /auth) -> Status:', res4.status, res4.body.message, 'User:', res4.body.user ? res4.body.user.userName : '');
    if (res4.status === 200 && res4.body.valid) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 4 lỗi:', err.message);
  }

  // Test 5: Gọi API Hello World (GET /) có token
  try {
    const res5 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Test 5 (GET / có token hợp lệ) -> Status:', res5.status, 'Message:', res5.body.message);
    if (res5.status === 200 && res5.body.message === 'Hello World') console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 5 lỗi:', err.message);
  }

  // Test 6: Đăng nhập với mật khẩu Base64 ('admin123' -> 'YWRtaW4xMjM=')
  try {
    const res6 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { userName: 'admin', password: 'YWRtaW4xMjM=' });
    console.log('Test 6 (Đăng nhập với Base64 password) -> Status:', res6.status, res6.body.message);
    if (res6.status === 200) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 6 lỗi:', err.message);
  }

  // Test 7: Đăng nhập với mật khẩu MD5 ('admin123' -> '0192023a7bbd73250516f069df18b500')
  try {
    const res7 = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { userName: 'admin', password: '0192023a7bbd73250516f069df18b500' });
    console.log('Test 7 (Đăng nhập với MD5 password) -> Status:', res7.status, res7.body.message);
    if (res7.status === 200) console.log('  => PASS ✅');
    else console.log('  => FAIL ❌');
  } catch (err) {
    console.error('Test 7 lỗi:', err.message);
  }

  console.log('--- HOÀN TẤT KIỂM THỬ ---');
}

runTests();
