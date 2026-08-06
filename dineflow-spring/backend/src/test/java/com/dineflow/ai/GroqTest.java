package com.dineflow.ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.ai.chat.client.ChatClient;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class GroqTest {

    @Autowired
    private ChatClient chatClient;

    @Test
    public void testGroqConnection() {
        String response = chatClient.prompt().user("Please briefly explain the importance of fast AI inference.").call().content();
        System.out.println("Groq Response: " + response);
        assertNotNull(response);
    }
}
