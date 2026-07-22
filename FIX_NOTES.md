# Ghi chú sửa lỗi - vanbangblockchain

## Các lỗi đã tìm thấy và xử lý

### 1. Lỗi build/TypeScript nghiêm trọng: thư mục `src/components/ui/` thừa
Project chứa một bộ component shadcn/ui đầy đủ (button, dialog, sidebar, chart, carousel, v.v.)
nhưng **không có file nào trong app (`pages`, `app`, `contexts`, `routes`, `components/common`,
`components/layout`) import các component này**. Đồng thời, `package.json` KHÔNG khai báo các
dependency mà những component đó cần (`@radix-ui/*`, `class-variance-authority`, `cmdk`,
`recharts`, `react-hook-form`, `sonner`, `vaul`, `embla-carousel-react`, v.v.)

=> Kết quả: `tsc -b` báo hơn 60 lỗi "Cannot find module", và đây rất có thể là nguyên nhân khiến
dev server bạn chạy trước đó bị lỗi/crash, dẫn đến lỗi `main.tsx:1 404` bạn thấy trong console.

**Đã xử lý:** xóa toàn bộ `src/components/ui/` (đã xác nhận không có chỗ nào dùng tới).
Sau khi xóa: `tsc -b` sạch, không còn lỗi nào.

### 2. `node_modules` trong file nén bị hỏng (native binary sai nền tảng)
Bộ `node_modules` đóng gói kèm theo bị lỗi vì các package có mã nhị phân native (rolldown/vite 8)
được build cho một hệ điều hành/kiến trúc khác, không chạy được ở môi trường khác.

**Đã xử lý:** xóa `node_modules` cũ, cài lại bằng `npm install`. Trong bản zip này mình đã bỏ
`node_modules` ra để file nhẹ — bạn chỉ cần chạy `npm install` sau khi giải nén.

### 3. Về lỗi `onboarding.js:48 - Cannot read properties of undefined (reading 'getImageNode')`
Đã tìm khắp `src/` — **không có file `onboarding.js` hay hàm `getImageNode` nào trong project
này**. Lỗi này đến từ content script của một tiện ích mở rộng trình duyệt (ví crypto kiểu
MetaMask, dựa vào các dòng log `contentscript.js`, `ObjectMultiplex`, `app-init-liveness` đi kèm
trong console). Không liên quan đến code của bạn, có thể bỏ qua hoặc tắt extension đó nếu thấy
khó chịu.

## Xác nhận đã hoạt động
- `npx tsc -b` → 0 lỗi
- `npx vite build` → build production thành công (dist/ được tạo, ~525 kB JS đã gzip còn ~174 kB)
- `npx vite` (dev server) → khởi động bình thường ở `http://localhost:5173`

## Cách chạy lại
```bash
npm install
npm run dev      # chạy dev server
npm run build    # build production
```

## Gợi ý thêm (không bắt buộc)
- Bundle JS ~525 kB hơi lớn (vite cảnh báo) — có thể cân nhắc code-splitting bằng
  `React.lazy()` cho các trang (`AdminPage`, `IssueCertificatePage`, ...) nếu muốn tối ưu.
- Nếu sau này thực sự cần dùng shadcn/ui, hãy cài lại từng component qua
  `npx shadcn@latest add <component>` thay vì copy nguyên bộ — nó sẽ tự thêm đúng dependency
  vào `package.json`.
