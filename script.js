const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const savedTheme = localStorage.getItem("boostlab-theme") || "light";

const setTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem("boostlab-theme", theme);

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему");
  }

  if (themeToggleText) {
    themeToggleText.textContent = theme === "dark" ? "Dark" : "Light";
  }
};

setTheme(savedTheme);

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

const glowPalette = [
  "var(--glow-violet)",
  "var(--glow-purple)",
  "var(--glow-orange)",
  "var(--glow-blue)"
];

const randomRange = (min, max) => Math.random() * (max - min) + min;
const randomPercent = (min, max) => `${Math.round(randomRange(min, max))}%`;
const randomPx = (min, max) => `${Math.round(randomRange(min, max))}px`;
const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];

document.querySelectorAll(".visual-card, .glass-card, .glass-panel").forEach((card) => {
  const shouldGlow = Math.random() > 0.52;
  card.dataset.glow = shouldGlow ? "on" : "off";

  if (!shouldGlow) {
    card.style.setProperty("--glow-opacity", "0");
    return;
  }

  const colors = [...glowPalette].sort(() => Math.random() - 0.5);
  card.style.setProperty("--glow-a-x", randomPercent(-12, 112));
  card.style.setProperty("--glow-a-y", randomPercent(-12, 112));
  card.style.setProperty("--glow-b-x", randomPercent(-12, 112));
  card.style.setProperty("--glow-b-y", randomPercent(-12, 112));
  card.style.setProperty("--glow-c-x", randomPercent(-12, 112));
  card.style.setProperty("--glow-c-y", randomPercent(-12, 112));
  card.style.setProperty("--glow-a-color", colors[0]);
  card.style.setProperty("--glow-b-color", colors[1]);
  card.style.setProperty("--glow-c-color", colors[2]);
  card.style.setProperty("--glow-a-stop", randomPercent(32, 56));
  card.style.setProperty("--glow-b-stop", randomPercent(34, 62));
  card.style.setProperty("--glow-c-stop", randomPercent(28, 52));
  card.style.setProperty("--glow-blur", randomPx(12, 26));
  card.style.setProperty("--glow-inset", `-${randomPx(16, 42)}`);
  card.style.setProperty("--glow-opacity", randomRange(0.18, 0.42).toFixed(2));
  card.style.setProperty("--glow-scale", randomRange(0.9, 1.08).toFixed(2));
  card.style.setProperty("--rim-angle", `${Math.round(randomRange(0, 360))}deg`);
  card.style.setProperty("--rim-glow-x", randomPercent(0, 100));
  card.style.setProperty("--rim-glow-y", randomPercent(0, 100));
});

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

const parallaxItems = document.querySelectorAll(".floating");

window.addEventListener(
  "scroll",
  () => {
    const progress = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
    parallaxItems.forEach((item, index) => {
      const offset = (progress - 0.18) * (index + 1) * 18;
      item.style.setProperty("--scroll-offset", `${offset}px`);
      item.style.transform = `${item.dataset.baseTransform || ""} translateY(${offset}px)`;
    });
  },
  { passive: true }
);

document.querySelectorAll(".floating").forEach((item) => {
  item.dataset.baseTransform = getComputedStyle(item).transform === "none" ? "" : getComputedStyle(item).transform;
});

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.textContent = "Заявка подготовлена";
    setTimeout(() => {
      button.textContent = "Получить стратегию продвижения";
    }, 2200);
  });
});

const leadForm = document.querySelector(".lead-form");

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = leadForm.querySelector("button[type='submit']");
    const formData = new FormData(leadForm);

    const data = {
      name: formData.get("name"),
      contact: formData.get("contact"),
      marketplace: formData.get("marketplace"),
    };

    try {
      button.disabled = true;
      button.textContent = "Отправляем...";

      const response = await fetch("/api/send-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Ошибка отправки");
      }

      leadForm.reset();
      button.textContent = "Заявка отправлена";
    } catch (error) {
      button.textContent = "Ошибка отправки";
      alert("Не удалось отправить заявку. Попробуйте написать нам в Telegram.");
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Получить стратегию продвижения";
      }, 2500);
    }
  });
}