package edu.ctut.certificate.controller;

import edu.ctut.certificate.domain.CertificateBlock;
import edu.ctut.certificate.service.CertificateService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping
    public Map<String, Object> issue(@RequestBody Map<String, String> body) throws Exception {
        CertificateBlock block = certificateService.issueCertificate(
                body.get("studentId"), body.get("fullName"), body.get("degree"),
                body.get("grade"), body.get("issueDate"), body.get("faculty"));
        return Map.of("txHash", block.getTxHash(), "status", block.getStatus().toString());
    }

    @GetMapping("/{txHash}/status")
    public Map<String, Object> confirm(@PathVariable String txHash) throws Exception {
        CertificateBlock block = certificateService.confirmCertificate(txHash);
        return Map.of("txHash", block.getTxHash(), "status", block.getStatus().toString());
    }

    @GetMapping("/verify")
    public Object verify(@RequestParam String query) throws Exception {
        CertificateBlock block = certificateService.verifyCertificate(query);
        if (block == null) return null;
        return Map.of(
                "id", block.getCertId(),
                "holder", block.getFullName(),
                "degree", block.getDegree(),
                "issuedBy", block.getIssuedBy(),
                "issueDate", block.getIssueDate(),
                "faculty", block.getFaculty(),
                "txHash", block.getTxHash(),
                "ipfsDoc", block.getIpfsDoc(),
                "status", block.getStatus().toString()
        );
    }

    @PostMapping("/{certId}/revoke")
    public Map<String, Object> revoke(@PathVariable String certId, @RequestBody Map<String, String> body) throws Exception {
        boolean success = certificateService.revokeCertificate(certId, body.get("reason"));
        return Map.of("success", success);
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return certificateService.getAllCertificates().stream().map(block -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", block.getCertId());
            map.put("student", block.getFullName());
            map.put("degree", block.getDegree());
            map.put("date", block.getIssueDate());
            map.put("status", block.getStatus().toString());
            return map;
        }).toList();
    }

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> getByStudent(@PathVariable String studentId) {
        return certificateService.getByStudentId(studentId).stream().map(block -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", block.getCertId());
            map.put("title", block.getDegree());
            map.put("institution", block.getIssuedBy());
            map.put("date", block.getIssueDate());
            map.put("grade", block.getGrade());
            map.put("hash", block.getHash());
            return map;
        }).toList();
    }
}
