// Service xử lý kết nối ví MetaMask bằng ethers.js
// Đây là phần "thật" — thực sự gọi MetaMask, lấy địa chỉ ví, lắng nghe thay đổi tài khoản/mạng.
import { BrowserProvider } from "ethers";

// Khai báo window.ethereum (MetaMask inject vào window)
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

/**
 * Yêu cầu MetaMask kết nối và trả về địa chỉ ví đầu tiên.
 * Ném lỗi nếu MetaMask chưa cài hoặc người dùng từ chối kết nối.
 */
export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("Chưa cài đặt MetaMask. Vui lòng cài extension MetaMask rồi thử lại.");
  }
  const provider = new BrowserProvider(window.ethereum!);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error("Không lấy được địa chỉ ví. Vui lòng thử lại.");
  }
  return accounts[0];
}

/** Lấy thông tin mạng hiện tại đang kết nối (vd. Sepolia, Mainnet...) */
export async function getNetworkName(): Promise<string> {
  if (!isMetaMaskInstalled()) return "Unknown";
  const provider = new BrowserProvider(window.ethereum!);
  const network = await provider.getNetwork();
  return network.name;
}

/**
 * Yêu cầu người dùng ký một message để xác thực (dùng cho backend xác minh chủ sở hữu ví).
 * TODO: khi có backend thật, gọi hàm này trước khi login để lấy chữ ký gửi kèm request.
 */
export async function signAuthMessage(address: string, nonce: string): Promise<string> {
  const provider = new BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  const message = `Đăng nhập vào CertChain\nĐịa chỉ: ${address}\nNonce: ${nonce}`;
  return signer.signMessage(message);
}

/** Đăng ký lắng nghe khi người dùng đổi tài khoản MetaMask */
export function onAccountsChanged(handler: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum?.on) return () => {};
  const listener = (...args: unknown[]) => handler(args[0] as string[]);
  window.ethereum.on("accountsChanged", listener);
  return () => window.ethereum?.removeListener?.("accountsChanged", listener);
}
