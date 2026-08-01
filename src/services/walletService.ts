import { BrowserProvider, verifyMessage } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
      isMetaMask?: boolean;
    };
  }
}

export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function ensureSepoliaNetwork(): Promise<void> {
  if (!window.ethereum) throw new Error("Chưa cài MetaMask.");
  const chainId = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;
  if (chainId?.toLowerCase() === SEPOLIA_CHAIN_ID) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902)
      throw new Error("Vui lòng chuyển MetaMask sang mạng Sepolia Testnet.");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: SEPOLIA_CHAIN_ID,
          chainName: "Sepolia",
          nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        },
      ],
    });
  }
}

export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled())
    throw new Error(
      "Chưa cài MetaMask. Vui lòng cài extension MetaMask rồi thử lại.",
    );
  await ensureSepoliaNetwork();
  const provider = new BrowserProvider(window.ethereum!);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  if (!accounts?.length) throw new Error("Không lấy được địa chỉ ví.");
  return accounts[0];
}

export async function getNetworkName(): Promise<string> {
  if (!isMetaMaskInstalled()) return "Chưa kết nối";
  const provider = new BrowserProvider(window.ethereum!);
  return (await provider.getNetwork()).name;
}

export async function signAuthMessage(
  address: string,
  message: string,
): Promise<string> {
  const provider = new BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();

  const signerAddress = await signer.getAddress();

  if (signerAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error(
      `Tài khoản MetaMask đã thay đổi. Address FE: ${address}, signer: ${signerAddress}`,
    );
  }

  const signature = await signer.signMessage(message);

  const recoveredAddress = verifyMessage(message, signature);

  console.log("========== SIGN DEBUG ==========");
  console.log("Expected address :", address);
  console.log("Signer address   :", signerAddress);
  console.log("Recovered address:", recoveredAddress);
  console.log("Message JSON     :", JSON.stringify(message));
  console.log("Message length   :", message.length);
  console.log("Signature        :", signature);
  console.log("================================");

  if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(
      `FE tự xác minh chữ ký thất bại. Signer: ${signerAddress}, recovered: ${recoveredAddress}`,
    );
  }

  return signature;
}

export function onAccountsChanged(
  handler: (accounts: string[]) => void,
): () => void {
  if (!window.ethereum?.on) return () => {};
  const listener = (...args: unknown[]) => handler(args[0] as string[]);
  window.ethereum.on("accountsChanged", listener);
  return () => window.ethereum?.removeListener?.("accountsChanged", listener);
}

export function onChainChanged(handler: (chainId: string) => void): () => void {
  if (!window.ethereum?.on) return () => {};
  const listener = (...args: unknown[]) => handler(args[0] as string);
  window.ethereum.on("chainChanged", listener);
  return () => window.ethereum?.removeListener?.("chainChanged", listener);
}
