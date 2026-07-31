package edu.ctut.certificate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {

    @Value("${web3.rpc-url:}")
    private String rpcUrl;

    // Web3j bean luon duoc tao (khong ket noi ngay) de app khoi dong binh thuong ke ca khi chua cau hinh RPC.
    // Cac loi RPC/khong co cau hinh se duoc phat hien va bao ro khi thuc su goi (xem ServerWalletProvider,
    // BlockchainAvailabilityGuard, va CertificateService) thay vi fail-open bang khoa gia nhu code cu.
    @Bean
    public Web3j web3j() {
        String url = (rpcUrl == null || rpcUrl.isBlank()) ? "http://localhost:8545" : rpcUrl;
        return Web3j.build(new HttpService(url));
    }
}
