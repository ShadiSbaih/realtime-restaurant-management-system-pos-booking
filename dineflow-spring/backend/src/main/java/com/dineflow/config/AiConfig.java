package com.dineflow.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * AiConfig — wires the Spring AI ChatClient and a shared ObjectMapper.
 *
 * Spring AI auto-configures an OpenAI-compatible ChatModel from application.yml.
 * This class builds the ChatClient from that model and shares it as a bean.
 */
@Configuration
public class AiConfig {

    /**
     * Build a ChatClient from the auto-configured ChatModel.
     * Spring AI will inject the correct model based on application.yml settings.
     */
    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    /**
     * Shared ObjectMapper with sensible defaults.
     * Marked @Primary so it replaces any competing definitions.
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}
