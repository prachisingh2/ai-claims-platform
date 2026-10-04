package com.claims.config;

import com.claims.entity.Role;
import com.claims.entity.User;
import com.claims.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataSeeder {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // SEED USERS ONLY ONCE
            if (userRepository.count() > 0) {
                System.out.println(
                        "Users already exist. Skipping authentication user seeding."
                );
                return;
            }

            System.out.println(
                    "Starting authentication user seeding..."
            );

            // ADMIN ACCOUNTS
            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Claims Administrator",
                    "admin@claims.ai"
            );

            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Operations Manager",
                    "admin.ops@claims.ai"
            );

            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Claims Manager",
                    "admin.manager@claims.ai"
            );

            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Risk Analyst",
                    "admin.risk@claims.ai"
            );

            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Fraud Analyst",
                    "admin.fraud@claims.ai"
            );

            createAdmin(
                    userRepository,
                    passwordEncoder,
                    "Super Administrator",
                    "admin.super@claims.ai"
            );

            // CLAIMER ACCOUNTS
            // CUST-10001 → CUST-10150

            for (int i = 1; i <= 150; i++) {

                String customerId =
                        String.format("CUST-%05d", 10000 + i);

                String email =
                        "customer"
                                + String.format("%05d", 10000 + i)
                                + "@claims.ai";

                String name =
                        "Customer "
                                + String.format("%05d", 10000 + i);

                createClaimer(
                        userRepository,
                        passwordEncoder,
                        name,
                        email,
                        customerId
                );
            }

            // SEEDING COMPLETE
            System.out.println(
                    "Authentication users seeded successfully."
            );
            System.out.println(
                    "6 ADMIN accounts + 150 CLAIMER accounts"
            );
        };
    }

    // CREATE ADMIN
    private void createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String email) {

        User admin = new User(
                name,
                email,
                passwordEncoder.encode("Admin@123"),
                Role.ADMIN
        );

        userRepository.save(admin);

        System.out.println(
                "Created ADMIN: " + email
        );
    }

    // CREATE CLAIMER
    private void createClaimer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String email,
            String customerId) {

        User claimer = new User(
                name,
                email,
                passwordEncoder.encode("Claimer@123"),
                Role.CLAIMER,
                customerId
        );

        userRepository.save(claimer);

        System.out.println(
                "Created CLAIMER: " + email
                        + " → " + customerId
        );
    }
}