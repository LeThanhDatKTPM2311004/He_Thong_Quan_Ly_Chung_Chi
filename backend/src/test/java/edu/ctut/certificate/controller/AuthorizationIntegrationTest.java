package edu.ctut.certificate.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ctut.certificate.config.JwtService;
import edu.ctut.certificate.domain.*;
import edu.ctut.certificate.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthorizationIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;
    @Autowired AppUserRepository userRepository;
    @Autowired ObjectMapper objectMapper;

    AppUser student;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        student = new AppUser();
        student.setWalletAddress("0x1111111111111111111111111111111111aaaa");
        student.setFullName("Sinh vien Test");
        student.setStudentId("SV001");
        student.setRole(UserRole.STUDENT);
        student.setStatus(UserStatus.ACTIVE);
        student = userRepository.save(student);
    }

    @Test
    void noJwt_returns401() throws Exception {
        mockMvc.perform(post("/api/certificates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentSpoofingXUserRoleHeader_stillGets403() throws Exception {
        String token = jwtService.generateToken(student);

        String body = objectMapper.writeValueAsString(new Object() {
            public final String studentId = "SV001";
            public final String fullName = "Nguyen Van A";
            public final String degree = "Ky su CNTT";
            public final String faculty = "CNTT";
        });

        mockMvc.perform(post("/api/certificates")
                        .header("Authorization", "Bearer " + token)
                        .header("X-User-Role", "admin") // co gang gia mao - phai bi bo qua hoan toan
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminUpdateRole_belowLastAdmin_isForbidden() throws Exception {
        AppUser admin = new AppUser();
        admin.setWalletAddress("0x2222222222222222222222222222222222bbbb");
        admin.setFullName("Admin Duy Nhat");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin = userRepository.save(admin);

        String token = jwtService.generateToken(admin);

        mockMvc.perform(put("/api/users/" + admin.getId() + "/role")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"STUDENT\"}"))
                .andExpect(status().isForbidden());
    }
}
