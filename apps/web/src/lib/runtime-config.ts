export type RuntimeAppConfig = {
  VITE_SERVER_URL?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeAppConfig;
  }
}

export function getRuntimeAppConfig(): RuntimeAppConfig | undefined {
  return window.__APP_CONFIG__;
}
