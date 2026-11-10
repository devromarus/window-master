import { useEffect, useState } from "react";
import { Button, Card, Intent } from "@blueprintjs/core";
import { siteConfig } from "./site.config";

const KEY = "cookie-consent";
const EVENT = "open-cookie-settings";
const id = siteConfig.analytics.yandexMetrikaId;

function read(): "yes" | "no" | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}
function write(v: "yes" | "no") {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* приватный режим — просто не запоминаем */
  }
}

let loaded = false;
function loadMetrika() {
  if (loaded || !id) return;
  loaded = true;
  const w = window as unknown as { ym?: (...a: unknown[]) => void } & Record<string, unknown>;
  // Официальный код Яндекс Метрики, загружается только после согласия
  (function (m: any, e: Document, t: string, r: string, i: string) {
    m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = Date.now();
    const k = e.createElement(t) as HTMLScriptElement;
    const a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode!.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  w.ym!(Number(id), "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

/** Баннер появляется, только если в настройках указан счётчик Метрики */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    const v = read();
    if (v === "yes") loadMetrika();
    else if (v === null) setVisible(true);
    const on = () => setVisible(true);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  if (!id || !visible) return null;

  return (
    <Card className="cookie" elevation={3} role="dialog" aria-label="Согласие на cookie">
      <p>
        Мы используем файлы cookie и сервис «Яндекс Метрика», чтобы понимать, как посетители пользуются
        сайтом. Подробнее — в <a href="#/privacy">политике конфиденциальности</a>.
      </p>
      <div className="cookie-actions">
        <Button
          intent={Intent.PRIMARY}
          text="Принять"
          onClick={() => { write("yes"); loadMetrika(); setVisible(false); }}
        />
        <Button
          variant="outlined"
          text="Отклонить"
          onClick={() => {
            write("no");
            setVisible(false);
            if (loaded) window.location.reload();
          }}
        />
      </div>
    </Card>
  );
}
