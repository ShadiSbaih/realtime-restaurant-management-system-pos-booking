package com.dineflow.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * RealtimeService — broadcasts STOMP messages, replacing Socket.io's io.emit().
 *
 * Topic mapping from original Socket.io events:
 *   new-order            → /topic/orders
 *   order-status-changed → /topic/orders/status
 *   new-reservation      → /topic/reservations
 *   status-reservation   → /topic/reservations/status
 *   table-updated        → /topic/tables
 *   menu-updated         → /topic/menu
 *   ai-action-updated    → /topic/ai-jobs/{userId}
 */
@Service
@RequiredArgsConstructor
public class RealtimeService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewOrder(Object payload) {
        messagingTemplate.convertAndSend("/topic/orders", payload);
    }

    public void broadcastOrderStatusChanged(Object payload) {
        messagingTemplate.convertAndSend("/topic/orders/status", payload);
    }

    public void broadcastNewReservation(Object payload) {
        messagingTemplate.convertAndSend("/topic/reservations", payload);
    }

    public void broadcastReservationStatus(Object payload) {
        messagingTemplate.convertAndSend("/topic/reservations/status", payload);
    }

    public void broadcastTableUpdated(Object payload) {
        messagingTemplate.convertAndSend("/topic/tables", payload);
    }

    public void broadcastMenuUpdated(Object payload) {
        messagingTemplate.convertAndSend("/topic/menu", payload);
    }

    public void broadcastAiAction(String userId, Object payload) {
        messagingTemplate.convertAndSend("/topic/ai-jobs/" + userId, payload);
    }

    public void broadcastPaymentStatus(String paymentId, Object payload) {
        messagingTemplate.convertAndSend("/topic/payments/" + paymentId, payload);
    }
}
