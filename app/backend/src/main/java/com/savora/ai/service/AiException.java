package com.savora.ai.service;

/**
 * Domain exception for all AI-layer failures.
 * Wraps both API and parse errors with a consistent type.
 */
public class AiException extends RuntimeException {

    public AiException(String message) {
        super(message);
    }

    public AiException(String message, Throwable cause) {
        super(message, cause);
    }
}
