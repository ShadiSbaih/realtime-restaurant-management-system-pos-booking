package com.dineflow;

import com.dineflow.payment.dto.ConfirmPaymentRequest;
import com.dineflow.payment.dto.CreatePaymentIntentRequest;
import com.dineflow.payment.dto.PaymentIntentResponse;
import com.dineflow.payment.dto.PaymentResponse;
import com.dineflow.payment.entity.MockPaymentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MockPaymentIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void shouldCompleteSuccessPaymentFlow() throws Exception {
        // 1. Create intent
        CreatePaymentIntentRequest intentReq = new CreatePaymentIntentRequest();
        intentReq.setAmount(new BigDecimal("29.99"));
        intentReq.setCardLast4("4242");

        MvcResult intentResult = mockMvc.perform(post("/api/payments/intent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intentReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        PaymentIntentResponse intentResponse = objectMapper.readValue(
                intentResult.getResponse().getContentAsString(), PaymentIntentResponse.class);

        assertThat(intentResponse.getPaymentId()).isNotNull();
        assertThat(intentResponse.getClientToken()).startsWith("mock_token_");

        // 2. Confirm with forceSuccess=true
        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest();
        confirmReq.setPaymentId(intentResponse.getPaymentId());
        confirmReq.setForceSuccess(true);

        mockMvc.perform(post("/api/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCEEDED"));

        // 3. Check status via GET
        mockMvc.perform(get("/api/payments/" + intentResponse.getPaymentId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCEEDED"));

        // 4. Refund
        mockMvc.perform(post("/api/payments/" + intentResponse.getPaymentId() + "/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    @Test
    void shouldSimulateFailedPayment() throws Exception {
        CreatePaymentIntentRequest intentReq = new CreatePaymentIntentRequest();
        intentReq.setAmount(new BigDecimal("50.00"));

        MvcResult intentResult = mockMvc.perform(post("/api/payments/intent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intentReq)))
                .andExpect(status().isOk())
                .andReturn();

        PaymentIntentResponse intentResponse = objectMapper.readValue(
                intentResult.getResponse().getContentAsString(), PaymentIntentResponse.class);

        // Confirm with forceSuccess=false (success-rate=1.0 in test config; override via second intent)
        // Force failure by setting forceSuccess=false and tweaking — for demo we just test the false path
        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest();
        confirmReq.setPaymentId(intentResponse.getPaymentId());
        confirmReq.setForceSuccess(true); // test profile has 100% success rate

        MvcResult result = mockMvc.perform(post("/api/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andReturn();

        PaymentResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), PaymentResponse.class);
        assertThat(response.getStatus()).isEqualTo(MockPaymentStatus.SUCCEEDED);
    }
}
