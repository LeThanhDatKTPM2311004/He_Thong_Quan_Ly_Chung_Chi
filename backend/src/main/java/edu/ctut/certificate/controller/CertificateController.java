package edu.ctut.certificate.controller;

import edu.ctut.certificate.config.JwtAuthFilter;
import edu.ctut.certificate.domain.Certificate;
import edu.ctut.certificate.dto.*;
import edu.ctut.certificate.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@Tag(name = "Certificates", description = "Phat hanh / tra cuu / thu hoi chung chi tren Sepolia")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ISSUER')")
    @Operation(summary = "Phat hanh chung chi moi (ghi giao dich that len Sepolia)")
    public IssueCertificateResponse issue(@Valid @RequestBody IssueCertificateRequest request, Authentication auth) {
        return certificateService.issueCertificate(request, currentUserId(auth));
    }

    @GetMapping("/{txHash}/status")
    @Operation(summary = "Kiem tra trang thai giao dich (issue hoac revoke) tren chain - cong khai")
    public TransactionStatusResponse status(@PathVariable String txHash) {
        return certificateService.confirmTransaction(txHash);
    }

    @GetMapping("/verify")
    @Operation(summary = "Tra cuu + doi chieu du lieu DB voi on-chain - cong khai")
    public VerifyCertificateResponse verify(@RequestParam String query) {
        return certificateService.verifyCertificate(query);
    }

    @PostMapping("/{certId}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thu hoi chung chi (ghi giao dich that len Sepolia)")
    public RevokeCertificateResponse revoke(@PathVariable String certId, @Valid @RequestBody RevokeCertificateRequest body,
                                             Authentication auth) {
        return certificateService.revokeCertificate(certId, body.reason(), currentUserId(auth));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sach chung chi (phan trang)")
    public Page<CertificateResponse> getAll(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Certificate> result = certificateService.getAllPaged(pageable);
        return result.map(certificateService::toResponse);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','ISSUER') or (hasRole('STUDENT') and #studentId == principal.studentId)")
    @Operation(summary = "Danh sach chung chi cua mot sinh vien - STUDENT chi xem duoc cua chinh minh")
    public List<CertificateResponse> getByStudent(@PathVariable String studentId) {
        return certificateService.getByStudentId(studentId).stream().map(certificateService::toResponse).toList();
    }

    private Long currentUserId(Authentication auth) {
        return ((JwtAuthFilter.AuthenticatedPrincipal) auth.getPrincipal()).userId();
    }
}
