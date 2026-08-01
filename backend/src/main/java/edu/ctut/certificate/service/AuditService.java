package edu.ctut.certificate.service;

import edu.ctut.certificate.domain.AuditAction;
import edu.ctut.certificate.domain.AuditLog;
import edu.ctut.certificate.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    // detail khong duoc chua private key, JWT hoac chu ky day du - chi log id/dia chi/trang thai.
    public void log(AuditAction action, Long actorUserId, String actorWallet, String targetType, String targetId, String detail) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setActorUserId(actorUserId);
        log.setActorWallet(actorWallet);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetail(detail);
        repository.save(log);
    }
}
