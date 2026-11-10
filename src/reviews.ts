import { siteConfig } from "./site.config";

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  /** ISO-дата */
  date: string;
  master?: string;
  /** true — сгенерированный пример, а не отзыв клиента */
  demo: boolean;
}

/** Детерминированный ГПСЧ, чтобы набор отзывов не менялся между сборками */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Ольга", "Дмитрий", "Наталья", "Игорь", "Марина", "Алексей", "Светлана", "Павел",
  "Татьяна", "Сергей", "Ирина", "Виктор", "Екатерина", "Максим", "Людмила", "Роман",
  "Анна", "Владимир", "Галина", "Николай", "Юлия", "Артём", "Вера", "Константин",
];

// {m} — имя мастера
const TEMPLATES: Record<number, string[]> = {
  5: [
    "Дуло из-под створки на кухне. {m} отрегулировал прижим и заменил уплотнитель — теперь закрывается плотно, сквозняка нет.",
    "Приехал в тот же день, всё показал и объяснил. Лишнего не навязывал, цену назвал сразу.",
    "Балконная дверь перестала цеплять раму. Работал аккуратно, после себя убрал.",
    "Отрегулировал все окна в квартире и смазал фурнитуру. Результатом очень довольна.",
    "{m} заменил сломанную ручку и петлю на балконной двери за полчаса. Рекомендую.",
    "Утеплили откосы перед зимой — дома заметно теплее. Спасибо за работу!",
    "Вежливый мастер, приехал точно ко времени. Окно больше не продувает.",
  ],
  4: [
    "Работу сделали хорошо, окно закрывается легко. Приехали чуть позже оговорённого, но предупредили заранее.",
    "{m} всё починил, но нужную петлю пришлось ждать пару дней. В остальном всё отлично.",
    "Хороший мастер, объяснил, как ухаживать за фурнитурой. Цена вышла немного выше первоначальной из-за материалов.",
    "Отрегулировали три окна, всё работает. Хотелось бы чуть больше аккуратности с подоконником, но в целом доволен.",
  ],
  3: [
    "Окно отрегулировали, дуть перестало. Но пришлось переносить визит, и итоговая сумма оказалась выше, чем ожидал.",
    "В целом нормально: уплотнитель заменили, но одну створку пришлось донастраивать повторным визитом (бесплатно).",
    "Работа выполнена, но мастер торопился и мало что объяснил. Результат пока устраивает.",
  ],
};

function pickRating(r: number): number {
  // ~60% — 5, ~28% — 4, ~12% — 3
  if (r < 0.6) return 5;
  if (r < 0.88) return 4;
  return 3;
}

/** Генерирует count демо-отзывов с оценкой от 3 до 5 */
export function generateDemoReviews(count: number, seed: number, masters: string[]): Review[] {
  const rnd = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  const used = new Set<string>();
  const out: Review[] = [];
  let dayOffset = 1;

  for (let i = 0; i < count; i++) {
    const rating = pickRating(rnd());
    const master = masters.length ? pick(masters) : "Мастер";
    let text = pick(TEMPLATES[rating]);
    // стараемся не повторять один и тот же текст подряд
    for (let tries = 0; used.has(text) && tries < 5; tries++) text = pick(TEMPLATES[rating]);
    used.add(text);
    dayOffset += 1 + Math.floor(rnd() * 6);
    out.push({
      id: `demo-${seed}-${i}`,
      name: pick(NAMES),
      rating,
      text: text.replace(/\{m\}/g, master),
      date: new Date(now - dayOffset * 86_400_000).toISOString().slice(0, 10),
      master,
      demo: true,
    });
  }
  return out;
}

export function getReviews(): Review[] {
  const { real, demo } = siteConfig.reviews;
  const realReviews: Review[] = real.map((r, i) => ({
    id: `real-${i}`,
    ...r,
    rating: Math.min(5, Math.max(1, Math.round(r.rating))),
    demo: false,
  }));
  const demoReviews = demo.enabled
    ? generateDemoReviews(demo.count, demo.seed, siteConfig.masters.map((m) => m.name))
    : [];
  return [...realReviews, ...demoReviews].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatRelative(iso: string): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (days <= 1) return "вчера";
  if (days < 7) return `${days} ${plural(days, "день", "дня", "дней")} назад`;
  if (days < 14) return "неделю назад";
  if (days < 30) return `${Math.floor(days / 7)} недели назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
