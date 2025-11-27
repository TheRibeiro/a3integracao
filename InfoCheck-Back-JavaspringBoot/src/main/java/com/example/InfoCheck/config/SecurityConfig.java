package com.example.InfoCheck.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors()  // habilita CORS
            .and()
            .csrf().disable() // desativa CSRF (necessário para POST do frontend)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // libera todas rotas
            );

        return http.build();
    }
}
