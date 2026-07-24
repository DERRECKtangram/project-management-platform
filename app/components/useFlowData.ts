"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultFlowData, type FlowData } from "./flowTypes";

export function useFlowData() {
  const [data, setData] = useState<FlowData>(defaultFlowData);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/flow", { cache: "no-store" });
      const nextData = (await response.json()) as FlowData & { error?: string };
      if (!response.ok) {
        throw new Error(nextData.error || "讀取資料失敗");
      }
      setData(nextData);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "讀取資料失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, message, setMessage, refresh };
}
