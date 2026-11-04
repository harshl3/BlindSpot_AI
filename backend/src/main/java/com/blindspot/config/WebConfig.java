package com.blindspot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public WebConfig(
            @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:8080,https://blindspot-ai-t1bn.onrender.com,https://*.onrender.com}") 
            String allowedOriginsStr) {
        this.allowedOrigins = Arrays.stream(allowedOriginsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = allowedOrigins.toArray(new String[0]);
        registry.addMapping("/**")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
