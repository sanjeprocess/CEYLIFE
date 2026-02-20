"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MessageType = "ping" | "pong" | "init" | "redirect" | "error";

export interface WebSocketMessage {
  type: MessageType;
  requestId?: string;
  formId?: string;
  metadata?: Record<string, unknown>;
  redirectLink?: string;
  error?: string;
}

export interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  onRedirect?: (redirectLink: string, requestId: string) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  reconnectIntervalMs?: number;
  pingIntervalMs?: number;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  requestId: string | null;
  getRequestId: () => string | null; // Synchronous getter using ref
  connect: () => void;
  disconnect: () => void;
  sendInit: (formId: string, metadata?: Record<string, unknown>) => boolean;
  isReady: () => boolean;
}

export function useWebSocket({
  url,
  enabled = true,
  onRedirect,
  onError,
  autoReconnect = true,
  reconnectIntervalMs = 3000,
  pingIntervalMs = 30000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use ref to store requestId for synchronous access (state updates are async)
  const requestIdRef = useRef<string | null>(null);
  
  // Use refs for callbacks to prevent unnecessary re-renders
  const onRedirectRef = useRef(onRedirect);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onRedirectRef.current = onRedirect;
    onErrorRef.current = onError;
  }, [onRedirect, onError]);

  const clearTimers = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    requestIdRef.current = null;
    setRequestId(null);
  }, [clearTimers]);

  const connect = useCallback(() => {
    if (!enabled) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" satisfies MessageType }));
          }
        }, pingIntervalMs);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(String(event.data));
          switch (message.type) {
            case "init":
              if (message.requestId) {
                requestIdRef.current = message.requestId; // Update ref synchronously
                setRequestId(message.requestId); // Update state for re-renders
              }
              break;
            case "redirect":
              if (message.redirectLink && message.requestId) {
                onRedirectRef.current?.(message.redirectLink, message.requestId);
              }
              break;
            case "error":
              onErrorRef.current?.(message.error || "Unknown WebSocket error");
              break;
            case "pong":
              break;
            case "ping":
              // ignore
              break;
          }
        } catch (err) {
          console.error("[useWebSocket] Failed to parse message:", err);
          onErrorRef.current?.("Failed to parse WebSocket message");
        }
      };

      ws.onerror = () => {
        onErrorRef.current?.("WebSocket connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        requestIdRef.current = null;
        setRequestId(null);
        clearTimers();

        if (enabled && autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectIntervalMs);
        }
      };
    } catch (err) {
      console.error("[useWebSocket] Failed to create WebSocket:", err);
      onErrorRef.current?.("Failed to establish WebSocket connection");
    }
  }, [
    enabled,
    url,
    autoReconnect,
    reconnectIntervalMs,
    pingIntervalMs,
    clearTimers,
  ]);

  const isReady = useCallback(() => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  const sendInit = useCallback(
    (formId: string, metadata?: Record<string, unknown>): boolean => {
      if (!enabled) {
        onErrorRef.current?.("WebSocket is not enabled");
        return false;
      }
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        onErrorRef.current?.("WebSocket is not connected");
        return false;
      }
      try {
        wsRef.current.send(
          JSON.stringify({
            type: "init" satisfies MessageType,
            formId,
            metadata,
          })
        );
        return true;
      } catch (err) {
        console.error("[useWebSocket] Failed to send init:", err);
        onErrorRef.current?.("Failed to send init message");
        return false;
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    connect();
    return () => {
      disconnect();
    };
    // Only depend on enabled and url - connect/disconnect are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, url]);

  const getRequestId = useCallback(() => {
    return requestIdRef.current;
  }, []);

  return {
    isConnected,
    requestId,
    getRequestId,
    connect,
    disconnect,
    sendInit,
    isReady,
  };
}

