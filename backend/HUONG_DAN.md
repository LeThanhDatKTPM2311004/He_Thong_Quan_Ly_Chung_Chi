# Backend - He Thong Quan Ly Chung Chi (Blockchain)

## Cach dung file zip nay

1. Giai nen file zip nay ra 1 thu muc rieng (KHONG giai nen de vao project cu neu con giu lai, tranh trung file).
2. Mo thu muc do bang VS Code / IntelliJ.
3. File nay CHUA co `.mvn` va `mvnw` (Maven Wrapper) - neu can, copy 2 file `mvnw`, `mvnw.cmd` va thu muc `.mvn` tu project cu (ban da tao truoc do) vao day. Hoac tao lai bang lenh: `mvn -N io.takari:maven:wrapper` (can May da cai Maven).
4. Sua file `src/main/resources/application.properties`:
   - `spring.datasource.password=` -> dien mat khau MySQL cua ban (neu co).
5. Neu muon dung Web3j/Sepolia that, dien 3 dong cuoi file `application.properties`:
   - `web3.rpc-url` -> RPC URL tu Infura/Alchemy
   - `web3.contract-address` -> dia chi smart contract da deploy tren Remix
   - `web3.private-key` -> private key vi server (KHONG commit len git!)
6. Chay lenh: `.\mvnw.cmd clean install -U` (Windows) de tai dependency va build.
7. Chay app bang IDE (nut Run) hoac `.\mvnw.cmd spring-boot:run`.
8. Swagger UI: http://localhost:5000/swagger-ui/index.html

## Luu y

- Neu chua co du lieu Web3j (rpc-url/contract-address/private-key de trong), app van chay va bien dich duoc,
  nhung goi cac API `/api/certificates` (POST/verify/revoke) se bao loi vi khong ket noi duoc blockchain that.
- Nho tao it nhat 1 user mau trong bang `users` (qua MySQL Workbench) truoc khi test dang nhap email/password.
- Contract Solidity mau (de deploy tren Remix) da duoc gui rieng trong chat, dat ten file `CertificateRegistry.sol`.
