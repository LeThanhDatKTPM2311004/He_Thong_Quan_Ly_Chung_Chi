package edu.ctut.certificate.config;

import edu.ctut.certificate.repository.WalletNonceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

// Don dep nonce het han dinh ky, tranh phinh bang wallet_nonces.
@Component
public class NonceCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(NonceCleanupScheduler.class);

    private final WalletNonceRepository repository;

    public NonceCleanupScheduler(WalletNonceRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Scheduled(fixedRate = 15 * 60 * 1000) // moi 15 phut
    public void cleanupExpiredNonces() {
        int deleted = repository.deleteExpiredBefore(Instant.now());
        if (deleted > 0) {
            log.info("Da xoa {} nonce het han", deleted);
        }
    }
}