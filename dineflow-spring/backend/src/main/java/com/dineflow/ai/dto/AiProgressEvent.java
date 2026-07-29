package com.dineflow.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * AiProgressEvent — the WebSocket payload broadcast to the frontend.
 *
 * Frontend subscribes on /topic/ai-jobs/{userId} and reads these fields.
 *
 * status values: RUNNING | COMPLETED | FAILED
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiProgressEvent(
        String status,
        int progress,
        String message,
        Object result
) {
    public static AiProgressEvent running(int progress, String message) {
        return new AiProgressEvent("RUNNING", progress, message, null);
    }

    public static AiProgressEvent completed(Object result) {
        return new AiProgressEvent("COMPLETED", 100, "Done!", result);
    }

    public static AiProgressEvent failed(String message) {
        return new AiProgressEvent("FAILED", -1, message, null);
    }
}
