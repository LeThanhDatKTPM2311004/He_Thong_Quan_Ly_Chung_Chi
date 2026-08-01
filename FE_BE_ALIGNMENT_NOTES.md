# FE aligned with current Spring Boot API / Sepolia flow

Updated frontend integration:
- MetaMask challenge: `GET /api/auth/nonce?address=...`
- MetaMask login: `POST /api/auth/metamask-login` with `{ address, signature }`
- Student registration: `POST /api/auth/register` with `{ address, signature, fullName, studentId }`
- Normalize backend roles `ADMIN/ISSUER/STUDENT` to frontend roles.
- Normalize backend user fields `walletAddress/fullName/status`.
- User admin APIs: list, create, role update, approve, lock.
- Certificate pagination response from `GET /api/certificates?page=&size=`.
- Normalize certificate fields/status and map `issueTxHash` to Etherscan links.
- Issue, revoke, transaction status, public verify, and student certificate APIs aligned with Swagger screenshots.
- Login screen keeps the existing visual style, removes unsupported email/password login, and adds MetaMask student registration.
- Network label corrected to Sepolia Testnet.

Validation:
- TypeScript compilation (`tsc -b`) passes.
- Vite bundle could not be executed in this Linux sandbox because the uploaded Windows `node_modules` lacks Rolldown's Linux native optional dependency. Run `npm install` then `npm run build` on the target machine.
