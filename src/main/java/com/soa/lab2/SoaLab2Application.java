package com.soa.lab2;

import com.soa.lab2.entity.User;
import com.soa.lab2.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SoaLab2Application {

    public static void main(String[] args) {
        SpringApplication.run(SoaLab2Application.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User("admin", "123456"));
            }
        };
    }
}
