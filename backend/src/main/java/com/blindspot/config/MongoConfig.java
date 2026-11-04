package com.blindspot.config;

import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoTimeoutCustomizer() {
        return builder -> builder
                .applyToSocketSettings(socket -> socket
                        .connectTimeout(10, TimeUnit.SECONDS)
                        .readTimeout(20, TimeUnit.SECONDS))
                .applyToClusterSettings(cluster -> cluster
                        .serverSelectionTimeout(10, TimeUnit.SECONDS))
                .applyToServerSettings(server -> server
                        .heartbeatFrequency(15, TimeUnit.SECONDS)
                        .minHeartbeatFrequency(500, TimeUnit.MILLISECONDS))
                .applyToConnectionPoolSettings(pool -> pool
                        .maxWaitTime(10, TimeUnit.SECONDS)
                        .maxConnectionIdleTime(60, TimeUnit.SECONDS));
    }
}
