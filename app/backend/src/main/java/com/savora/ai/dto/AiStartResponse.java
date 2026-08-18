package com.savora.ai.dto;

import java.util.UUID;

/**
 * Response returned immediately when an async AI job is started.
 * The client uses the jobId for WebSocket routing AND as an HTTP poll fallback.
 */
public record AiStartResponse(UUID jobId, String message) {}
