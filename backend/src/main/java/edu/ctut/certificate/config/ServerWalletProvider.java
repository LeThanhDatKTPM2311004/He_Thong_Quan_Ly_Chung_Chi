package edu.ctut.certificate.config;

import edu.ctut.certificate.exception.BlockchainConfigurationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;

// Thay the cho @Bean Credentials cung nhu code cu (khong con fallback bang private key Hardhat gia).
// Neu SERVER_WALLET_PRIVATE_KEY chua duoc cau hinh, moi thao tac can ky giao dich se nhan
// BlockchainConfigurationException (-> HTTP 503) thay vi am tham dung vi gia khong co tien that.
@Component
public class ServerWalletProvider {

    @Value("${web3.private-key:}")
    private String privateKey;

    @Value("${web3.contract-address:}")
    private String contractAddress;

    @Value("${web3.rpc-url:}")
    private String rpcUrl;

    public boolean isConfigured() {
        return privateKey != null && !privateKey.isBlank()
                && contractAddress != null && !contractAddress.isBlank()
                && rpcUrl != null && !rpcUrl.isBlank();
    }

    public Credentials credentials() {
        if (privateKey == null || privateKey.isBlank()) {
            throw new BlockchainConfigurationException(
                    "SERVER_WALLET_PRIVATE_KEY chua duoc cau hinh. Chuc nang phat hanh/thu hoi chung chi tam thoi bi vo hieu hoa.");
        }
        return Credentials.create(privateKey);
    }

    public String contractAddress() {
        if (contractAddress == null || contractAddress.isBlank()) {
            throw new BlockchainConfigurationException("CONTRACT_ADDRESS chua duoc cau hinh.");
        }
        return contractAddress;
    }

    public void assertConfigured() {
        if (!isConfigured()) {
            throw new BlockchainConfigurationException(
                    "Blockchain chua duoc cau hinh day du (RPC/contract/private key). Xem .env.example.");
        }
    }
}
