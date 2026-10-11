// Lokal inkişaf üçün SAMPLE data yaradır. Real məlumat deyil (BRIEF §3.4), is_sample=true.
import { randomUUID } from 'node:crypto';

const houses = [
  { slug: 'gil', name: 'Gil evi', color: '#E8682A', order: 1 },
  { slug: 'resm', name: 'Rəsm evi', color: '#6FA8DC', order: 2 },
  { slug: 'metbex', name: 'Mətbəx', color: '#FFC23D', order: 3 },
  { slug: 'elm', name: 'Elm evi', color: '#7BC67E', order: 4 },
];

const masterclasses = [
  { house: 'gil', slug: 'gil-boshqab', title: 'SAMPLE: Gil boşqab düzəltmək', ageMin: 6, ageMax: 9, capacity: 10, booked: 7, price: 25 },
  { house: 'resm', slug: 'kosmos-resmi', title: 'SAMPLE: Kosmos rəsmi — öz planetini çək', ageMin: 4, ageMax: 6, capacity: 10, booked: 4, price: 20 },
  { house: 'metbex', slug: 'balaca-ashpaz-pizza', title: 'SAMPLE: Balaca aşpaz — öz pizzanı bişir', ageMin: 7, ageMax: 12, capacity: 10, booked: 9, price: 22 },
  { house: 'elm', slug: 'vulkan-tecrubesi', title: 'SAMPLE: Vulkan və köpük təcrübələri', ageMin: 8, ageMax: 12, capacity: 10, booked: 2, price: 20, earlyBird: 15, earlyBirdSlots: 3 },
];

export default async function seedSampleData(db) {
  const houseIds = {};
  for (const h of houses) {
    const id = randomUUID();
    houseIds[h.slug] = id;
    await db.query(
      `INSERT INTO houses (id, slug, name, color_hex, sort_order) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO NOTHING`,
      [id, h.slug, h.name, h.color, h.order],
    );
  }

  const masterclassIds = {};
  for (const m of masterclasses) {
    const { rows: existing } = await db.query('SELECT id FROM masterclasses WHERE slug = $1', [m.slug]);
    let masterclassId = existing[0]?.id;
    if (!masterclassId) {
      masterclassId = randomUUID();
      await db.query(
        `INSERT INTO masterclasses (id, house_id, slug, title, description, age_min, age_max, is_published, is_sample)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true,true)`,
        [masterclassId, houseIds[m.house], m.slug, m.title, 'SAMPLE təsvir — real mətnlə əvəz olunacaq.', m.ageMin, m.ageMax],
      );
    }
    masterclassIds[m.slug] = masterclassId;

    const sessionId = randomUUID();
    await db.query(
      `INSERT INTO sessions
        (id, masterclass_id, starts_at, capacity, booked, price_azn, early_bird_price_azn, early_bird_slots, location, status)
       VALUES ($1,$2, now() + interval '7 days', $3, $4, $5, $6, $7, 'SAMPLE ünvan, Bakı', 'scheduled')`,
      [sessionId, masterclassId, m.capacity, m.booked, m.price, m.earlyBird ?? null, m.earlyBirdSlots ?? 0],
    );
  }

  const faqTabs = {
    q: [
      ['Qeydiyyat nə qədər vaxt aparır?', 'Təxminən 1 dəqiqə: uşağın adı və yaşı, valideynin adı və telefonu.'],
      ['Yer qalmayıbsa nə edim?', 'Gözləmə siyahısına yazılın. Yer açılan kimi WhatsApp-dan xəbər veririk.'],
    ],
    o: [['Ödənişi necə edə bilərəm?', '[Ödəniş üsulları: kart, nağd, köçürmə]']],
    t: [['Qrupda neçə uşaq olur?', 'Ən çox [N] uşaq. Hər qrupda [N] təlimçi var.']],
    g: [['Uşaq nə geyinməlidir?', 'Ləkələnməsindən qorxmadığınız rahat paltar. Önlük bizdən.']],
  };
  for (const [tab, items] of Object.entries(faqTabs)) {
    for (const [i, [q, a]] of items.entries()) {
      const { rows: existingFaq } = await db.query('SELECT id FROM faq_items WHERE tab = $1 AND question = $2', [tab, q]);
      if (existingFaq.length) continue;
      await db.query(
        'INSERT INTO faq_items (id, tab, question, answer, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [randomUUID(), tab, q, a, i],
      );
    }
  }

  // Həftənin tapşırığı — SAMPLE: cari (yoğur maketindəki robot tapşırığı) + 2 keçmiş qalib.
  const weeklyTasks = [
    { week: 10, title: 'SAMPLE: Evdəki əşyalardan robot düzəlt', daysAgo: 1, materials: ['karton qutu', 'butulka qapağı', 'kağız rulon', 'yapışqan', 'rəngli kağız'], relatedSlug: 'vulkan-tecrubesi', winnerLabel: null },
    { week: 9, title: 'SAMPLE: Yarpaqdan şəkil', daysAgo: 9, materials: ['payız yarpağı', 'karton', 'yapışqan'], relatedSlug: null, winnerLabel: 'SAMPLE: 8 yaşlı rəssam' },
    { week: 8, title: 'SAMPLE: Qapaqdan mozaika', daysAgo: 16, materials: ['butulka qapağı', 'karton', 'yapışqan'], relatedSlug: null, winnerLabel: 'SAMPLE: 11 yaşlı usta' },
  ];
  for (const wt of weeklyTasks) {
    const { rows: existingTask } = await db.query('SELECT id FROM weekly_tasks WHERE week_number = $1', [wt.week]);
    let taskId = existingTask[0]?.id;
    if (!taskId) {
      taskId = randomUUID();
      await db.query(
        `INSERT INTO weekly_tasks (id, week_number, title, instructions, materials, unlock_date, related_masterclass_id, is_published, is_sample)
         VALUES ($1,$2,$3,$4,$5, (now() - ($6::numeric * interval '1 day'))::date, $7, true, true)`,
        [taskId, wt.week, wt.title, 'SAMPLE təlimat — real mətnlə əvəz olunacaq.', wt.materials, wt.daysAgo, wt.relatedSlug ? masterclassIds[wt.relatedSlug] : null],
      );
    }
    if (wt.winnerLabel) {
      const { rows: existingP } = await db.query('SELECT id FROM task_participants WHERE task_id = $1', [taskId]);
      if (!existingP.length) {
        await db.query(
          `INSERT INTO task_participants (id, task_id, age_group, child_label, consent_public, is_winner)
           VALUES ($1,$2,$3,$4,true,true)`,
          [randomUUID(), taskId, '7-9', wt.winnerLabel],
        );
      }
    }
  }

  return masterclasses.length;
}
