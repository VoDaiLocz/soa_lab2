package com.soa.lab2.controller;

import com.soa.lab2.dto.LoginRequest;
import com.soa.lab2.entity.User;
import com.soa.lab2.repository.UserRepository;
import com.soa.lab2.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping({"/login", "/"})
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUserName() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing username or password"));
        }

        Optional<User> optionalUser = userRepository.findByUserName(request.getUserName());
        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            if (!user.getPassword().equals(request.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
            }
        } else {
            user = new User(request.getUserName(), request.getPassword());
        }

        String token = jwtUtil.generateToken(user.getUserName());
        user.setToken(token);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userName", user.getUserName());
        response.put("idUser", user.getIdUser());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Missing or invalid token"));
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Token expired or invalid"));
        }

        String username = jwtUtil.extractUsername(token);
        return ResponseEntity.ok(Map.of(
                "status", "valid",
                "userName", username
        ));
    }
}
