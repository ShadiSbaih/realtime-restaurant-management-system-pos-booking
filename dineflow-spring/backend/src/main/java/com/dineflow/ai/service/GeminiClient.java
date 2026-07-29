package com.dineflow.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * GeminiClient — thin wrapper around Spring AI ChatClient.
 *
 * Handles the one quirk of LLM responses: models often wrap JSON in
 * markdown code fences (```json ... ```) even when instructed not to.
 * This extractor strips fences before parsing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiClient {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    private static final Pattern JSON_FENCE = Pattern.compile(
            "```(?:json)?\\s*(\\{[\\s\\S]*?})\\s*```", Pattern.CASE_INSENSITIVE);

    /**
     * Send a prompt and parse the response as a JSON object (Map).
     * Strips markdown fences, then parses. Throws on failure.
     */
    public Map<String, Object> generateJson(String prompt) {
        String raw = callModel(prompt);
        String json = extractJson(raw);
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.error("Failed to parse AI JSON. Raw response: {}", raw);
            throw new AiException("AI returned non-parseable JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Send a prompt and get the raw text response.
     */
    public String generateText(String prompt) {
        return callModel(prompt);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private String callModel(String prompt) {
        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("503") || msg.contains("high demand") || msg.contains("too many requests") || msg.contains("429")) {
                log.warn("Gemini API overloaded/unavailable: {}", e.getMessage());
                throw new AiException("AI service is currently experiencing high demand. Please try again in a few moments.", e);
            }
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new AiException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Extract JSON object from raw model output.
     * Tries markdown fence first, then falls back to raw string trim.
     */
    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new AiException("AI returned an empty response.");
        }

        // Try to strip markdown code fences
        Matcher m = JSON_FENCE.matcher(raw);
        if (m.find()) {
            return m.group(1).trim();
        }

        // If no fences, try to find raw { ... } block
        int start = raw.indexOf('{');
        int end   = raw.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return raw.substring(start, end + 1);
        }

        return raw.trim();
    }
}
