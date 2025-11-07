const iframes = document.querySelectorAll("iframe");
iframes.forEach((iframe) => {
  iframe.addEventListener("load", () => {
    const pveAuthCookieParameter = iframe.src.indexOf("PVEAuthCookie=");
    if (pveAuthCookieParameter !== -1) {
      const pveAuthCookieValue = iframe.src.substring(
        pveAuthCookieParameter + 15
      );
      iframe.contentDocument.cookie = `PVEAuthCookie=${pveAuthCookieValue}; path=/`;
    }
  });
});
