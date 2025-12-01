package com.example.InfoCheck.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuração do RestTemplate com timeouts adequados para APIs externas
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10)) // Timeout de conexão: 10 segundos
                .setReadTimeout(Duration.ofSeconds(30)) // Timeout de leitura: 30 segundos
                .requestFactory(this::clientHttpRequestFactory)
                .build();
    }

    private SimpleClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 segundos
        factory.setReadTimeout(30000); // 30 segundos
        return factory;
    }
}
