import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function useServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/services`, {
          method: 'GET',
          signal: controller.signal,
        });

        const data = await response.json().catch(() => []);

        if (!response.ok || !Array.isArray(data)) {
          setServices([]);
          return;
        }

        setServices(data);
      } catch {
        setServices([]);
      }
    }

    void loadServices();

    return () => {
      controller.abort();
    };
  }, []);

  return { services };
}
