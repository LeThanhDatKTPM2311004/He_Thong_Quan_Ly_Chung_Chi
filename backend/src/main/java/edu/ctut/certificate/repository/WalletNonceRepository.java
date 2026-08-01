package edu.ctut.certificate.repository;

import edu.ctut.certificate.domain.WalletNonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface WalletNonceRepository extends JpaRepository<WalletNonce, Long> {

    Optional<WalletNonce> findByNonceAndWalletAddress(String nonce, String walletAddress);

    List<WalletNonce> findAllByWalletAddressAndUsedFalse(String walletAddress);

    @Modifying
    @Query("update WalletNonce n set n.used = true, n.usedAt = :now where n.walletAddress = :walletAddress and n.used = false")
    int invalidateAllUnusedForWallet(String walletAddress, Instant now);

    @Modifying
    @Query("delete from WalletNonce n where n.expiresAt < :threshold")
    int deleteExpiredBefore(Instant threshold);
}
