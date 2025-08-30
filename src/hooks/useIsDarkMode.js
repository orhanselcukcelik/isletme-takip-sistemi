// src/hooks/useIsDarkMode.js
import { useState, useEffect } from "react";

export default function useIsDarkMode() {
  const read = () =>
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark") ||
    window.localStorage?.getItem("theme") === "dark";

  const [isDark, setIsDark] = useState(() => read());

  useEffect(() => {
    // HTML/body class değişimini dinle (tema toggle'ı için)
    const obs = new MutationObserver(() => setIsDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // localStorage ile değişiklik olursa da yakalamak için
    const onStorage = () => setIsDark(read());
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return isDark;
}
