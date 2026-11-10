import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AnchorButton,
  Button,
  Callout,
  Card,
  Checkbox,
  Collapse,
  Drawer,
  Icon,
  InputGroup,
  Intent,
  Navbar,
  NavbarGroup,
  ProgressBar,
  Tag,
  type IconName,
} from "@blueprintjs/core";
import { siteConfig } from "./site.config";
import { formatRelative, getReviews, plural, type Review } from "./reviews";
import { ConsentDoc, PrivacyPolicy, SiteRules, operatorLine } from "./legal";
import { CookieBanner, openCookieSettings } from "./cookies";

const cfg = siteConfig;
const tel = `tel:${cfg.contacts.phoneHref}`;
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

type Route = "home" | "privacy" | "consent" | "rules";
function useRoute(): Route {
  const read = (): Route => {
    const h = window.location.hash;
    if (h === "#/privacy") return "privacy";
    if (h === "#/consent") return "consent";
    if (h === "#/rules") return "rules";
    return "home";
  };
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

function scrollToId(id: string) {
  if (window.location.hash.startsWith("#/")) {
    window.location.hash = "";
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

const NAV = [
  { id: "masters", label: "Мастера", icon: "people" as IconName },
  { id: "prices", label: "Цены", icon: "tag" as IconName },
  { id: "reviews", label: "Отзывы", icon: "chat" as IconName },
  { id: "faq", label: "Вопросы", icon: "help" as IconName },
  { id: "contacts", label: "Контакты", icon: "phone" as IconName },
];

/* ---------------- Header ---------------- */

function Logo() {
  return (
    <a className="logo" href="#" onClick={(e) => { e.preventDefault(); scrollToId("top"); }}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <rect x="2" y="2" width="30" height="30" rx="5" fill="var(--brand)" />
        <rect x="6" y="6" width="10" height="22" rx="1.5" fill="var(--paper)" />
        <path d="M19 6h9v22h-9z" fill="var(--accent)" transform="skewY(-8) translate(0 3)" />
        <circle cx="14" cy="17" r="1.4" fill="var(--brand)" />
      </svg>
      <span>
        <b>{cfg.brand.name}</b>
        <small>{cfg.brand.tagline}</small>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar className="header" fixedToTop>
      <div className="container header-inner">
        <NavbarGroup>
          <Logo />
        </NavbarGroup>
        <NavbarGroup className="header-nav">
          {NAV.slice(1).map((n) => (
            <Button key={n.id} variant="minimal" text={n.label} onClick={() => scrollToId(n.id)} />
          ))}
        </NavbarGroup>
        <NavbarGroup>
          <a className="header-phone" href={tel}>{cfg.contacts.phone}</a>
          <Button className="header-burger" variant="minimal" icon="menu" aria-label="Меню" onClick={() => setOpen(true)} />
        </NavbarGroup>
      </div>
      <Drawer isOpen={open} onClose={() => setOpen(false)} size="80%" title={cfg.brand.name} icon="home">
        <div className="drawer-body">
          {NAV.map((n) => (
            <Button
              key={n.id}
              fill
              alignText="start"
              variant="minimal"
              size="large"
              icon={n.icon}
              text={n.label}
              onClick={() => { setOpen(false); setTimeout(() => scrollToId(n.id), 250); }}
            />
          ))}
          <AnchorButton href={tel} intent={Intent.SUCCESS} size="large" fill icon="phone" text="Позвонить" />
          <p className="muted center">{cfg.hero.callNote}</p>
        </div>
      </Drawer>
    </Navbar>
  );
}

/* ---------------- Blocks ---------------- */

function Advantages({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "adv adv-compact" : "adv"}>
      {cfg.advantages.map((a) => (
        <div className="adv-item" key={a.title}>
          <span className="adv-icon"><Icon icon={a.icon as IconName} size={22} /></span>
          <div>
            <h4>{a.title}</h4>
            <span>{a.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, photo, size = 96 }: { name: string; photo?: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  if (!photo || broken) {
    return (
      <div className="avatar avatar-empty" style={{ width: size, height: size }} aria-label={name}>
        {name.slice(0, 1)}
      </div>
    );
  }
  return (
    <img
      className="avatar"
      src={asset(photo)}
      alt={`Мастер ${name}`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} icon="star" size={size} className={i <= Math.round(value) ? "star-on" : "star-off"} />
      ))}
    </span>
  );
}

function Hero({ avg, total }: { avg: number; total: number }) {
  const lead = cfg.masters[0];
  return (
    <section className="hero" id="top">
      <div className="hero-text">
        <Tag minimal round icon="map-marker" className="hero-city">{cfg.city}</Tag>
        <h1>{cfg.hero.title}</h1>
        <p className="hero-lead">{cfg.hero.lead}</p>
        <p>{cfg.hero.text}</p>
        <div className="hero-cta">
          <AnchorButton href={tel} intent={Intent.SUCCESS} size="large" icon="phone" text={cfg.contacts.phone} />
          <Button size="large" variant="outlined" icon="automatic-updates" text="Перезвоните мне" onClick={() => scrollToId("callback")} />
        </div>
        <p className="muted">{cfg.hero.callNote}</p>
      </div>
      {lead && (
        <Card className="hero-card" elevation={2}>
          <div className="hero-window" aria-hidden>
            <div /><div />
          </div>
          <div className="hero-master">
            <Avatar name={lead.name} photo={lead.photo} size={84} />
            <div>
              <div className="hero-master-name">
                {lead.name}
                {lead.available && <Tag intent={Intent.SUCCESS} minimal round>свободен</Tag>}
              </div>
              <span className="muted">{lead.role}</span>
              {total > 0 && (
                <div className="hero-rating">
                  <Stars value={avg} />
                  <b>{avg.toFixed(1)}</b>
                  <span className="muted">· {total} {plural(total, "отзыв", "отзыва", "отзывов")}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

function Masters() {
  return (
    <section className="section" id="masters">
      <h2>Наши мастера</h2>
      <div className="masters">
        {cfg.masters.map((m) => (
          <Card key={m.name} className="master" elevation={1}>
            <Avatar name={m.name} photo={m.photo} size={120} />
            <h3>{m.name}</h3>
            <span>{m.role}</span>
            <div className="master-tags">
              <Tag minimal icon="time">{m.experience}</Tag>
              <Tag minimal intent={m.available ? Intent.SUCCESS : Intent.NONE}>
                {m.available ? "свободен сегодня" : "запись на завтра"}
              </Tag>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function formatPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = d.slice(1);
  let out = "+7";
  if (p.length) out += " (" + p.slice(0, 3);
  if (p.length >= 3) out += ") " + p.slice(3, 6);
  if (p.length >= 6) out += "-" + p.slice(6, 8);
  if (p.length >= 8) out += "-" + p.slice(8, 10);
  return out;
}

function Callback({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  const enabled = Boolean(cfg.form.endpoint);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const phoneOk = phone.replace(/\D/g, "").length === 11;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!enabled || !agree || !phoneOk) return;
    setState("sending");
    try {
      const r = await fetch(cfg.form.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, consent: true, consentVersion: cfg.legal.documentsDate, page: location.href }),
      });
      setState(r.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <Card className="callback" id={id} elevation={1}>
      <h2>{title}</h2>
      {subtitle && <p className="muted">{subtitle}</p>}
      {state === "ok" ? (
        <Callout intent={Intent.SUCCESS} icon="tick-circle">{cfg.form.successText}</Callout>
      ) : (
        <form onSubmit={submit} className="callback-form">
          <InputGroup size="large" placeholder="Ваше имя" leftIcon="person" value={name} onValueChange={setName} disabled={!enabled} />
          <InputGroup
            size="large"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            leftIcon="phone"
            value={phone}
            onValueChange={(v) => setPhone(v ? formatPhone(v) : "")}
            disabled={!enabled}
          />
          <Checkbox checked={agree} onChange={(e) => setAgree(e.currentTarget.checked)} disabled={!enabled} className="consent">
            Даю <a href="#/consent">согласие на обработку персональных данных</a> и ознакомлен(а) с{" "}
            <a href="#/privacy">политикой конфиденциальности</a>
          </Checkbox>
          <Button
            type="submit"
            intent={Intent.PRIMARY}
            size="large"
            text="Перезвоните мне"
            loading={state === "sending"}
            disabled={!enabled || !agree || !phoneOk}
            fill
          />
          {!enabled && (
            <Callout icon="phone" intent={Intent.WARNING} compact>
              Заявки временно принимаем только по телефону:{" "}
              <a href={tel}><b>{cfg.contacts.phone}</b></a>
            </Callout>
          )}
          {state === "error" && (
            <Callout intent={Intent.DANGER} compact>Не удалось отправить заявку. Позвоните нам, пожалуйста.</Callout>
          )}
        </form>
      )}
    </Card>
  );
}

function Prices() {
  return (
    <section className="section" id="prices">
      <h2>Стоимость работ</h2>
      <div className="prices">
        {cfg.prices.map((p) => (
          <div className="price" key={p.title}>
            <span>{p.title}</span>
            <span className="price-dots" />
            <b>{p.price}</b>
          </div>
        ))}
      </div>
      <p className="muted small">{cfg.priceNote} Не является публичной офертой.</p>
    </section>
  );
}

function Reviews({ reviews }: { reviews: Review[] }) {
  const [shown, setShown] = useState(cfg.reviews.pageSize);
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const hasDemo = reviews.some((r) => r.demo);
  if (!total) return null;

  return (
    <section className="section" id="reviews">
      <h2>{total} {plural(total, "отзыв", "отзыва", "отзывов")} о нашей работе</h2>
      {hasDemo && (
        <Callout intent={Intent.WARNING} icon="info-sign" className="demo-note">
          Отзывы с пометкой «пример» сгенерированы для демонстрации макета и не являются отзывами
          реальных клиентов.
        </Callout>
      )}
      <div className="reviews-layout">
        <Card className="rating-card">
          <div className="rating-big">{avg.toFixed(1)}</div>
          <Stars value={avg} size={18} />
          <span className="muted">{total} {plural(total, "оценка", "оценки", "оценок")}</span>
          <div className="bars">
            {counts.map((c, i) => (
              <div className="bar" key={i}>
                <span>{5 - i}<Icon icon="star" size={11} className="star-on" /></span>
                <ProgressBar value={total ? c / total : 0} stripes={false} animate={false} intent={Intent.WARNING} />
                <span className="muted">{c}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="reviews">
          {reviews.slice(0, shown).map((r) => (
            <Card key={r.id} className="review">
              <div className="review-head">
                <b>{r.name}</b>
                {r.demo && <Tag minimal intent={Intent.WARNING}>пример</Tag>}
              </div>
              <p>{r.text}</p>
              <div className="review-foot">
                <Stars value={r.rating} />
                <span className="muted">
                  {r.master ? `мастер ${r.master} · ` : ""}
                  {formatRelative(r.date)}
                </span>
              </div>
            </Card>
          ))}
          {shown < total && (
            <Button variant="outlined" size="large" text="Показать ещё" onClick={() => setShown((s) => s + cfg.reviews.pageSize)} />
          )}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section" id="faq">
      <h2>Ответы на вопросы</h2>
      <div className="faq">
        {cfg.faq.map((f, i) => (
          <Card key={f.q} className="faq-item" interactive onClick={() => setOpen(open === i ? null : i)}>
            <div className="faq-q">
              <h3>{f.q}</h3>
              <Icon icon={open === i ? "minus" : "plus"} />
            </div>
            <Collapse isOpen={open === i}>
              <p>{f.a}</p>
            </Collapse>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Contacts() {
  const c = cfg.contacts;
  return (
    <section className="section contacts-wrap" id="contacts">
      <div>
        <h2>Контакты</h2>
        <a className="big-phone" href={tel}><Icon icon="phone" size={22} /> {c.phone}</a>
        <p className="muted">{c.workHours}</p>
        <p><Icon icon="envelope" /> <a href={`mailto:${c.email}`}>{c.email}</a></p>
        <p><Icon icon="map-marker" /> {cfg.city}</p>
        <div className="messengers">
          {c.telegram && <AnchorButton href={c.telegram} target="_blank" rel="noopener" icon="send-message" text="Telegram" variant="outlined" />}
          {c.max && <AnchorButton href={c.max} target="_blank" rel="noopener" icon="chat" text="MAX" variant="outlined" />}
        </div>
        <h3 className="pluses-title">Наши плюсы</h3>
        <Advantages compact />
      </div>
      <Callback id="callback" title="Нужна консультация? Закажите звонок" subtitle="Перезвоним и подскажем, что можно сделать с окном." />
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-cols">
          <div>
            <Logo />
            <p className="muted small">{cfg.contacts.workHours}</p>
            <a href={tel} className="footer-phone">{cfg.contacts.phone}</a>
          </div>
          <ul>
            {NAV.map((n) => (
              <li key={n.id}><a href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollToId(n.id); }}>{n.label}</a></li>
            ))}
          </ul>
          <ul>
            <li><a href="#/rules">Правила сайта</a></li>
            <li><a href="#/privacy">Политика конфиденциальности</a></li>
            <li><a href="#/consent">Согласие на обработку данных</a></li>
            {cfg.analytics.yandexMetrikaId && (
              <li><a href="#" onClick={(e) => { e.preventDefault(); openCookieSettings(); }}>Настройки cookie</a></li>
            )}
          </ul>
        </div>
        <p className="small muted footer-legal">
          Исполнитель: {operatorLine()}. Информация на сайте носит справочный характер и не является
          публичной офертой (ст. 437 ГК РФ).
        </p>
        <p className="small muted">© {new Date().getFullYear()} {cfg.brand.name}</p>
      </div>
    </footer>
  );
}

function LegalPage({ route }: { route: Exclude<Route, "home"> }) {
  return (
    <main className="container legal-wrap">
      <Button icon="arrow-left" variant="minimal" text="На главную" onClick={() => (window.location.hash = "")} />
      {route === "privacy" && <PrivacyPolicy />}
      {route === "consent" && <ConsentDoc />}
      {route === "rules" && <SiteRules />}
    </main>
  );
}

/* ---------------- App ---------------- */

export default function App() {
  const route = useRoute();
  const reviews = useMemo(getReviews, []);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <Header />
      {route === "home" ? (
        <main className="container">
          <Hero avg={avg} total={reviews.length} />
          <Advantages />
          <Masters />
          <Prices />
          <Reviews reviews={reviews} />
          <Faq />
          <Contacts />
        </main>
      ) : (
        <LegalPage route={route} />
      )}
      <Footer />
      <div className="sticky-call">
        <AnchorButton href={tel} intent={Intent.SUCCESS} size="large" fill icon="phone" text="Позвонить" />
      </div>
      <CookieBanner />
    </>
  );
}
