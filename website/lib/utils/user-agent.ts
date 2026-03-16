export function parseUserAgent(ua: string): string {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown browser";

  const os = /Windows NT 10/.test(ua)
    ? "Windows 10/11"
    : /Windows NT 6\.3/.test(ua)
      ? "Windows 8.1"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Android/.test(ua)
            ? "Android"
            : /iPhone|iPad/.test(ua)
              ? "iOS"
              : /Linux/.test(ua)
                ? "Linux"
                : "Unknown OS";

  return `${browser} on ${os}`;
}
