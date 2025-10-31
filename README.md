TIKTOK

1. Tạo app trong tiktokshop partner (đăng nhập bằng tk tiktokshop)

2. truy cập https://seller-vn.tiktok.com/services/market (đăng nhập bằng tk tiktokshop)

3. Trên góc phải có menu ... click vào sẽ có Khắc phục và sự cố, vào trong đó sẽ thấy app
Sau khi uỷ quyền cho app sẽ chuyển hướng đến đường link (đã điền trong partner)
VD: {redirect_url}?code=FeBoANmHP3yqdoUI9fZOCw&state={state} thì code=FeBoANmHP3yqdoUI9fZOCw là cái cần lấy

code này chính là auth code (chỉ dùng được một lần để lấy ) thông tin x_tts_access_token sau khi lấy xong auth code sẽ ngay lập tức hết hạn. nếu access token hết hạn ta sẽ dùng refresh token để lấy lại chứ k dùng auth code nữa

3. sau khi lấy xong lưu vào biến môi trường

ACCESS_TOKEN=ROW_y7oD5wAAAAD4TjJxH-1Q_B_KrCH35u6OMXiBe3_CJcgM4N2uLzXCgRQkcVdEkMzKTMQWByDRFQwwAa5r_Z-R8SQ3spH-HGi_VHqo0aWkBmsuHWYNX4GmhQ 
ACCESS_TOKEN_EXPIRE_IN=1761642679
REFRESH_TOKEN=ROW_7WCQbwAAAAAOAaCMoMD9JXkV8tMOCvv5860RyiK0AmK4Wv21DPbxMpTFgeCnvCV7UCnMhof9VJA
REFRESH_TOKEN_EXPIRE_IN=4877987346 ~ 36075 ngày

ACCESS_TOKEN và REFRESH_TOKEN và REFRESH_TOKEN_EXPIRE_IN sẽ k thay đổi, khi gọi api REFRESH token thời gian ACCESS_TOKEN_EXPIRE_IN sẽ được cộng thêm. Do đó khi hết thời hạn REFRESH_TOKEN_EXPIRE_IN thì phải vào seller tiktok shop để cấp quyền lại và chạy lại hàm 
getTikTok_x_tts_access_token(auth_code) để lấy lại token

** Chú ý khi thay đổi scope của app cũng cần cấp quyền lại và chạy lại RE_AUTHORIZE.js để cập nhật lại token theo auth code mới




// const fields = Object.entries(ORDER_FIELD_MAP).map(([key, label]) => ({ 
    // field_name: label, 
    // type: 2, 
    // }));