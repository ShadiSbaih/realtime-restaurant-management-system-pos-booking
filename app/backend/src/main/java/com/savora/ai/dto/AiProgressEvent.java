package com.savora.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

/**
 * AiProgressEvent — the WebSocket payload broadcast to the frontend.
 *
 * Frontend subscribes on /topic/ai-jobs/{userId} and reads these fields.
 *
 * status values: RUNNING | COMPLETED | FAILED
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiProgressEvent(
        String jobId,
        String status,
        int progress,
        String message,
        Object result
) {
    public static AiProgressEvent running(UUID jobId, int progress, String message) {
        return new AiProgressEvent(jobId != null ? jobId.toString() : null, "RUNNING", progress, message, null);
    }

    public static AiProgressEvent completed(UUID jobId, Object result) {
        return new AiProgressEvent(jobId != null ? jobId.toString() : null, "COMPLETED", 100, "Done!", result);
    }

    public static AiProgressEvent failed(UUID jobId, String message) {
        return new AiProgressEvent(jobId != null ? jobId.toString() : null, "FAILED", -1, message, null);
    }
}
