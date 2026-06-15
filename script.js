const siteHeader = document.querySelector(".site-header");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

const setHeaderScrollState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 8);
};

let scrollFrame = null;

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      setHeaderScrollState();
      scrollFrame = null;
    });
  },
  { passive: true },
);

setHeaderScrollState();

const setMobileMenu = (isOpen) => {
  siteHeader?.classList.toggle("is-menu-open", isOpen);
  document.body.classList.toggle("is-menu-open", isOpen);
  mobileMenuToggle?.setAttribute("aria-expanded", String(isOpen));
  mobileMenuToggle?.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
};

mobileMenuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setMobileMenu(!siteHeader?.classList.contains("is-menu-open"));
});

mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMobileMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMobileMenu(false);
  }
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
      product: formData.get("product"),
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
      alert(error.message || "Не удалось отправить заявку. Попробуйте написать нам в Telegram.");
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Получить расчёт рейтинга";
      }, 2500);
    }
  });
}

const contactInput = document.querySelector('input[name="contact"]');

function isTelegramContact(value) {
  const trimmed = value.trim();

  return trimmed.startsWith("@") || /[a-zA-Zа-яА-Я]/.test(trimmed);
}

function formatRussianPhone(value) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  let numbers = digits;

  if (numbers.startsWith("8")) {
    numbers = `7${numbers.slice(1)}`;
  }

  if (!numbers.startsWith("7")) {
    numbers = `7${numbers}`;
  }

  numbers = numbers.slice(0, 11);

  if (numbers.length < 11) {
    return value;
  }

  const code = numbers.slice(1, 4);
  const part1 = numbers.slice(4, 7);
  const part2 = numbers.slice(7, 9);
  const part3 = numbers.slice(9, 11);

  return `+7 (${code}) ${part1}-${part2}-${part3}`;
}

if (contactInput) {
  contactInput.addEventListener("focusout", () => {
    const value = contactInput.value.trim();

    if (!value || isTelegramContact(value)) {
      return;
    }

    contactInput.value = formatRussianPhone(value);
  });
}
