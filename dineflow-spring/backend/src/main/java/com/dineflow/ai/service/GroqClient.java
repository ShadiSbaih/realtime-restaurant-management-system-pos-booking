package com.dineflow.ai.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * GroqClient — thin wrapper around Spring AI ChatClient for the Groq OpenAI-compatible API.
 *
 * Handles the one quirk of LLM responses: models often wrap JSON in
 * markdown code fences (```json ... ```) even when instructed not to.
 * This extractor strips fences before parsing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GroqClient {

    private final ChatClient chatClient;

    // Dedicated mapper for AI responses: tolerate unescaped control characters
    // (e.g. newlines inside recipe strings) that models often emit.
    private final ObjectMapper objectMapper = JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
            .enable(JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();

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
            // Covers: HTTP 429, 503, and LLM overloaded/rate-limit keywords
            boolean isTransient = msg.contains("503")
                    || msg.contains("429")
                    || msg.contains("high demand")
                    || msg.contains("too many requests")
                    || msg.contains("quota")
                    || msg.contains("rate_limit")
                    || msg.contains("rate limit")
                    || msg.contains("overloaded")
                    || msg.contains("resource_exhausted");
            if (isTransient) {
                log.warn("Groq API rate-limited/overloaded: {}", e.getMessage());
                throw new AiException("AI service is currently experiencing high demand. Please try again in a few moments.", e);
            }
            log.error("Groq API call failed: {}", e.getMessage(), e);
            throw new AiException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    /**
     * Extract a balanced JSON object from raw model output.
     * Tries markdown fence first, then falls back to scanning for the
     * outermost balanced { ... } block so internal } characters don't
     * fool a simple regex.
     */
    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new AiException("AI returned an empty response.");
        }

        // Try to strip markdown code fences first
        Matcher m = JSON_FENCE.matcher(raw);
        if (m.find()) {
            return m.group(1).trim();
        }

        // Find the outermost balanced { ... } block, respecting strings.
        int start = raw.indexOf('{');
        if (start == -1) {
            throw new AiException("AI response does not contain a JSON object.");
        }

        int depth = 0;
        boolean inString = false;
        char quote = 0;
        boolean escape = false;
        for (int i = start; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (escape) {
                escape = false;
                continue;
            }
            if (c == '\\') {
                escape = true;
                continue;
            }
            if (inString) {
                if (c == quote) {
                    inString = false;
                }
                continue;
            }
            if (c == '"') {
                inString = true;
                quote = c;
                continue;
            }
            if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return raw.substring(start, i + 1).trim();
                }
            }
        }

        throw new AiException("AI response contains an unbalanced JSON object.");
    }
}
