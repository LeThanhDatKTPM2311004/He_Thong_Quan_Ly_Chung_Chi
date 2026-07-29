package edu.ctut.certificate.controller;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.domain.UserRole;
import edu.ctut.certificate.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository repository;

    public UserController(AppUserRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repository.findAll().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail() == null ? "" : u.getEmail());
            map.put("role", u.getRole().toString());
            return map;
        }).toList();
    }

    // Khop voi muc 6: admin gan role issuer/admin cho user khac
    @PutMapping("/{id}/role")
    public Map<String, Object> updateRole(@PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        if (!"admin".equals(callerRole)) {
            throw new RuntimeException("Chi admin moi duoc gan role");
        }
        AppUser user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay user"));
        UserRole newRole = UserRole.valueOf(body.get("role"));
        user.setRole(newRole);
        repository.save(user);
        return Map.of("id", user.getId(), "role", user.getRole().toString());
    }
}