package com.dineflow.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

/**
 * GeminiClient — calls Google Gemini REST API.
 * Same prompts as the original Inngest functions in backend/src/inngest/function.ts
 */
@Service
@Slf4j
public class GeminiClient {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate content from Gemini and return parsed JSON.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateJson(String prompt) {
        try {
            String url = String.format(GEMINI_URL, model, apiKey);
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{Map.of("text", prompt)})
                    },
                    "generationConfig", Map.of("responseMimeType", "application/json")
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API error {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Gemini API error " + response.statusCode() + ": " + response.body());
            }

            // Parse the response structure
            Map<String, Object> parsed = objectMapper.readValue(response.body(), Map.class);
            var candidates = (java.util.List<?>) parsed.get("candidates");
            
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No candidates found in Gemini response. Possible safety block: " + response.body());
            }

            var candidate = (Map<?, ?>) candidates.get(0);
            var content = (Map<?, ?>) candidate.get("content");

            if (content == null || !content.containsKey("parts")) {
                throw new RuntimeException("No content parts found in candidate: " + candidate);
            }
            var parts = (java.util.List<?>) content.get("parts");
            var part = (Map<?, ?>) parts.get(0);
            String text = (String) part.get("text");
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();

            return objectMapper.readValue(text, Map.class);
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }
}
