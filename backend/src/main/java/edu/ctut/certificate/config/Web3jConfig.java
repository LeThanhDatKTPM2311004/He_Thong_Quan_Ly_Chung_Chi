package edu.ctut.certificate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {

    @Value("${web3.rpc-url}")
    private String rpcUrl;

    @Value("${web3.private-key}")
    private String privateKey;

    @Bean
    public Web3j web3j() {
        // Neu rpcUrl rong, Web3j van khoi tao duoc (khong ket noi ngay), loi se xay ra khi thuc su goi API
        return Web3j.build(new HttpService(rpcUrl == null || rpcUrl.isBlank() ? "http://localhost:8545" : rpcUrl));
    }

    @Bean
    public Credentials credentials() {
        if (privateKey == null || privateKey.isBlank()) {
            // Private key gia - vi test cong khai cua Hardhat, KHONG co tien that, chi de app khong crash khi chua cau hinh
            return Credentials.create("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        }
        return Credentials.create(privateKey);
    }
}
