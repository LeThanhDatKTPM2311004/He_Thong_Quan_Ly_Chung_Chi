package edu.ctut.certificate.controller;

import edu.ctut.certificate.domain.AppUser;
import edu.ctut.certificate.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;

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
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("name", u.getName());
            map.put("email", u.getEmail() == null ? "" : u.getEmail());
            map.put("role", u.getRole().toString());
            return map;
        }).toList();
    }
}           