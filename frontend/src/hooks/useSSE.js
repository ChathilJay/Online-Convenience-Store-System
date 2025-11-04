import { useEffect, useRef, useCallback } from "react";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook for Server-Sent Events (SSE) to receive real-time notifications
 */
export const useSSE = (
  onOrderStatusUpdate,
  onPaymentUpdate,
  onInvoiceGenerated
) => {
  const eventSourceRef = useRef(null);
  const toast = useToast();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping SSE connection");
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Create EventSource with auth token as query parameter
      // (EventSource doesn't support custom headers)
      const url = `http://127.0.0.1:5000/api/sse/notifications?token=${encodeURIComponent(
        token
      )}`;
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log("SSE connection established");
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("SSE message received:", message);

          switch (message.type) {
            case "connected":
              console.log("SSE: Connected to notification stream");
              break;

            case "order_status_update":
              const { order_id, old_status, new_status } = message.data;

              // Show toast notification
              const statusMessages = {
                paid: `💳 Order #${order_id}: Payment confirmed!`,
                dispatched: `🚚 Order #${order_id}: Dispatched and on the way!`,
                delivered: `✅ Order #${order_id}: Delivered successfully!`,
                cancelled: `❌ Order #${order_id}: Has been cancelled.`,
              };

              if (statusMessages[new_status]) {
                toast.success(statusMessages[new_status], 8000);
              }

              // Call callback if provided
              if (onOrderStatusUpdate) {
                onOrderStatusUpdate(order_id, old_status, new_status);
              }
              break;

            case "payment_update":
              if (onPaymentUpdate) {
                onPaymentUpdate(message.data);
              }
              break;

            case "invoice_generated":
              toast.info(
                `📄 Invoice ${message.data.invoice_number} generated for Order #${message.data.order_id}`,
                5000
              );
              if (onInvoiceGenerated) {
                onInvoiceGenerated(message.data);
              }
              break;

            default:
              console.log("Unknown SSE message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(`Attempting to reconnect in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.log("Max reconnection attempts reached");
          toast.warning(
            "Real-time notifications disconnected. Refresh the page to reconnect.",
            10000
          );
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Error creating SSE connection:", error);
    }
  }, [onOrderStatusUpdate, onPaymentUpdate, onInvoiceGenerated, toast]);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    reconnect: connect,
  };
};

export default useSSE;
