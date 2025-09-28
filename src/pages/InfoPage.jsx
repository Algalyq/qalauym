import { useNavigate } from "react-router-dom";
import "../styles/pages/info-page.css";

const FEATURE_CARDS = [
  {
    title: "Готовые шаблоны",
    description:
      "Выбирайте из аккуратных пресетов и собирайте wish-лист за считанные минуты.",
  },
  {
    title: "Совместное бронирование",
    description:
      "Гости видят актуальный статус подарков и могут забронировать позицию без дублей.",
  },
  {
    title: "Умные напоминания",
    description:
      "Qalauym напомнит гостям о предстоящем событии и подскажет, какие идеи ещё свободны.",
  },
];

const STEP_CARDS = [
  {
    title: "Создайте аккаунт",
    description:
      "Зарегистрируйтесь и заполните несколько полей: событие, дата и несколько желаний.",
  },
  {
    title: "Поделитесь ссылкой",
    description:
      "Отправьте гостям персональную ссылку — им не нужно регистрироваться, чтобы выбрать подарок.",
  },
  {
    title: "Получайте подарки",
    description:
      "Следите за статусами и получайте именно то, что просили, без повторов и неловких моментов.",
  },
];

const FAQ_CARDS = [
  {
    question: "Что увидят гости?",
    answer:
      "Гости открывают ваш wish-лист, выбирают подарок и отмечают его как забронированный. Им не нужен аккаунт.",
  },
  {
    question: "Можно ли редактировать желания?",
    answer:
      "Да. Обновляйте описание, ссылку или цену в любой момент — изменения мгновенно увидят все гости.",
  },
  {
    question: "Работает ли Qalauym на десктопе?",
    answer:
      "Приложение оптимизировано под мобильные устройства, но гости могут просматривать списки с любого устройства.",
  },
];

export default function InfoPage() {
  const navigate = useNavigate();

  const handleSectionNavigation = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAuthNavigation = () => {
    navigate("/auth");
  };

  return (
    <div className="info-page">
      <main>
        <section className="hero" id="hero">
          <div className="container hero-inner">
            <div>
              <span className="badge mb-4">
                <span>🎁 Wish-list платформа</span>
                <span className="icon-dot" />
                <span>Для праздников, свадеб и друзей</span>
              </span>

              <h1 className="h1 hero-title mb-6">
                Получайте <span className="text-secondary">именно те подарки</span>, о которых мечтаете
              </h1>

              <p className="lead mb-6">
                Создавайте красивые виш-листы за минуты, делитесь ссылкой.
              </p>

              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={handleAuthNavigation}>
                  ✨ Попробовать
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section" id="features">
          <div className="container">
            <div className="section-header">
              <h2 className="h2 mb-4">Почему Qalauym</h2>
              <p>Инструменты, которые экономят время и помогают фокусироваться на самом важном — празднике.</p>
            </div>

            <div className="feature-grid">
              {FEATURE_CARDS.map(({ title, description }) => (
                <div key={title} className="feature-card">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="info-section" id="how">
          <div className="container">
            <div className="section-header">
              <h2 className="h2 mb-4">Как это работает</h2>
              <p>Всего три шага, и ваш wish-лист готов — гости видят актуальный статус подарков в реальном времени.</p>
            </div>

            <div className="steps-grid">
              {STEP_CARDS.map(({ title, description }, index) => (
                <div key={title} className="step-card">
                  <div className="step-index">0{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="info-section" id="faq">
          <div className="container">
            <div className="section-header">
              <h2 className="h2 mb-4">FAQ</h2>
              <p>Ответили на самые частые вопросы — чтобы вы могли запустить список за пару минут.</p>
            </div>

            <div className="faq-grid">
              {FAQ_CARDS.map(({ question, answer }) => (
                <div key={question} className="faq-card">
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="container">
            <div className="cta-card">
              <h2>Готовы собрать wish-лист мечты?</h2>
              <p>
                Подключайтесь к Qalauym уже сегодня.
              </p>
              <div className="cta-actions">
                <button type="button" className="btn btn-primary" onClick={handleAuthNavigation}>
                  Создать аккаунт
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleSectionNavigation("how")}
                >
                  Посмотреть шаги
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-note">
        <div className="containerө-1">
          <span>Qalauym © {new Date().getFullYear()}. Создано с любовью.</span>
        </div>
      </footer>
    </div>
  );
}