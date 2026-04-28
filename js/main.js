$(function () {
  initThemeMode();
  initHeroText();
  initCounters();
  initDestinationFilters();
  initCardZoom();
  initAgencyCards();
  initRating();
  initContactForm();
  initTooltips();
  initPriceHover();
  initBlogFilters();
  initBlogLikes();
  initScrollReveal();
  initPhishingModule();
});

function initThemeMode() {
  const storageKey = "bootstrap-theme";
  const storedTheme = localStorage.getItem(storageKey);
  const initialTheme =
    storedTheme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  function applyTheme(theme) {
    const darkMode = theme === "dark";
    $("body").toggleClass("dark-mode", darkMode);
    $("html").attr("data-theme", theme);

    const button = $("#themeToggle");
    const icon = button.find("i");
    const label = button.find(".theme-toggle-label");

    if (!button.length) {
      return;
    }

    button.attr("aria-pressed", String(darkMode));
    button.attr("title", darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    icon.attr("class", darkMode ? "bi bi-sun-fill" : "bi bi-moon-stars-fill");
    label.text(darkMode ? "Modo claro" : "Modo oscuro");
  }

  function ensureToggle() {
    if ($("#themeToggle").length) {
      return;
    }

    const navList = $(".navbar .navbar-nav").first();

    if (!navList.length) {
      applyTheme(initialTheme);
      return;
    }

    const toggleMarkup = `
      <li class="nav-item mt-3 mt-lg-0 ms-lg-2">
        <button
          class="btn theme-toggle-button"
          id="themeToggle"
          type="button"
          aria-label="Cambiar tema"
          aria-pressed="false"
        >
          <i class="bi bi-moon-stars-fill" aria-hidden="true"></i>
          <span class="theme-toggle-label">Modo oscuro</span>
        </button>
      </li>
    `;

    navList.append(toggleMarkup);
    $("#themeToggle").on("click", function () {
      const nextTheme = $("body").hasClass("dark-mode") ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
    applyTheme(initialTheme);
  }

  applyTheme(initialTheme);
  ensureToggle();
}

function sanitizeText(value) {
  return value.replace(/[<>]/g, "").replace(/\s{2,}/g, " ").trimStart();
}

function initHeroText() {
  const title = $("#hero-title");
  const subtitle = $("#hero-subtitle");

  if (!title.length) {
    return;
  }

  title.hide().delay(250).fadeIn(1200, function () {
    subtitle.hide().fadeIn(900);
  });
}

function initCounters() {
  $(".counter").each(function () {
    const $counter = $(this);
    const target = Number($counter.data("target")) || Number($counter.text());

    $({ countNum: 0 }).animate(
      { countNum: target },
      {
        duration: 2200,
        easing: "swing",
        step: function () {
          $counter.text(Math.ceil(this.countNum));
        },
        complete: function () {
          $counter.text(target);
        },
      },
    );
  });
}

function initDestinationFilters() {
  $(".filter-chip").on("click", function () {
    const filter = $(this).data("filter");
    const cards = $(".filter-item");

    $(".filter-chip").removeClass("active btn-primary").addClass("btn-outline-primary");
    $(this).removeClass("btn-outline-primary").addClass("active btn-primary");

    cards.each(function () {
      const matches = filter === "all" || $(this).data("category") === filter;
      $(this).toggle(matches);
    });
  });
}

function initCardZoom() {
  $(".destination-card, .blog-card").on("mouseenter", function () {
    const card = $(this);
    const frame = card.find(".media-frame");
    const video = card.find(".destination-video").get(0);

    card.addClass("is-hovered");
    frame.addClass("zoom-active");

    if (video) {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  });

  $(".destination-card, .blog-card").on("mouseleave", function () {
    const card = $(this);
    const frame = card.find(".media-frame");
    const video = card.find(".destination-video").get(0);

    card.removeClass("is-hovered");
    frame.removeClass("zoom-active");

    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  });
}

function initAgencyCards() {
  $(".flip-toggle").on("click", function () {
    $(this).closest(".agency-flip").toggleClass("is-flipped");
  });
}

function initRating() {
  $(".rating-stars .star").on("click", function () {
    const rating = Number($(this).data("value"));
    const group = $(this).closest(".rating-stars");
    const output = group.siblings(".rating-output");

    group.find(".star").each(function () {
      $(this).toggleClass("active", Number($(this).data("value")) <= rating);
    });

    output.text(`Calificacion seleccionada: ${rating} estrella${rating > 1 ? "s" : ""}.`);
  });
}

function validateField($field) {
  const value = sanitizeText($field.val());
  const type = $field.attr("type");
  const feedback = $field.closest(".form-field").find(".field-feedback");
  let valid = true;
  let message = "Se ve bien.";

  $field.val(value);

  if ($field.prop("required") && !value.trim()) {
    valid = false;
    message = "Este campo es obligatorio.";
  } else if (type === "email") {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    message = valid ? "Email valido." : "Ingresa un email valido.";
  } else if ($field.attr("pattern")) {
    const regex = new RegExp($field.attr("pattern"));
    valid = regex.test(value);
    message = valid ? "Formato correcto." : "Revisa el formato solicitado.";
  } else if (value.length < 3 && value.length > 0) {
    valid = false;
    message = "Ingresa al menos 3 caracteres.";
  }

  $field.toggleClass("input-valid", valid && value.length > 0);
  $field.toggleClass("input-invalid", !valid);
  feedback
    .text(value.length ? message : "")
    .removeClass("is-valid is-invalid")
    .addClass(value.length ? (valid ? "is-valid" : "is-invalid") : "");

  return valid;
}

function initContactForm() {
  const form = $("#contactForm");

  $(".contact-form input, .contact-form textarea, .contact-form select").on("input change", function () {
    validateField($(this));
  });

  if (!form.length) {
    return;
  }

  form.on("submit", function (event) {
    event.preventDefault();

    let allValid = true;
    form.find("input, textarea, select").each(function () {
      allValid = validateField($(this)) && allValid;
    });

    if (!allValid) {
      $("#formStatus").text("Corrige los campos marcados antes de enviar.");
      return;
    }

    const button = form.find("button[type='submit']");
    const spinner = button.find(".spinner-border");

    button.prop("disabled", true);
    spinner.removeClass("d-none");
    $("#formStatus").text("Enviando consulta...");

    setTimeout(function () {
      spinner.addClass("d-none");
      button.prop("disabled", false);
      $("#formStatus").text("Consulta validada y lista para integrarse con backend.");
      const modal = new bootstrap.Modal(document.getElementById("contactModal"));
      modal.show();
      form[0].reset();
      form.find(".field-feedback").text("").removeClass("is-valid is-invalid");
      form.find(".input-valid, .input-invalid").removeClass("input-valid input-invalid");
    }, 1500);
  });
}

function initTooltips() {
  $("[data-bs-toggle='tooltip']").each(function () {
    new bootstrap.Tooltip(this);
  });
}

function initPriceHover() {
  $(".pricing-table tbody tr").on("mouseenter", function () {
    $(this).addClass("is-hovered");
  });

  $(".pricing-table tbody tr").on("mouseleave", function () {
    $(this).removeClass("is-hovered");
  });
}

function initBlogFilters() {
  $(".blog-filter").on("click", function () {
    const filter = $(this).data("filter");
    const items = $(".blog-item");

    $(".blog-filter").removeClass("active btn-dark").addClass("btn-outline-dark");
    $(this).removeClass("btn-outline-dark").addClass("active btn-dark");

    items.each(function () {
      const matches = filter === "all" || $(this).data("category") === filter;
      $(this)[matches ? "fadeIn" : "fadeOut"](180);
    });
  });
}

function initBlogLikes() {
  const cards = $(".blog-card");

  if (!cards.length) {
    return;
  }

  function setLiked(card, liked) {
    const button = card.find(".blog-like-btn");
    const icon = button.find("i");

    card.toggleClass("is-liked", liked);
    button.attr("aria-pressed", String(liked));
    button.attr("aria-label", liked ? "Quitar me gusta" : "Dar me gusta");
    icon.attr("class", liked ? "bi bi-heart-fill" : "bi bi-heart");
  }

  function burstHeart(card) {
    const burst = card.find(".blog-heart-burst");

    if (!burst.length) {
      return;
    }

    burst.removeClass("is-animating");
    // Force reflow so the animation can restart on repeated likes.
    void burst[0].offsetWidth;
    burst.addClass("is-animating");

    setTimeout(function () {
      burst.removeClass("is-animating");
    }, 850);
  }

  $(".blog-like-btn").on("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const card = $(this).closest(".blog-card");
    const liked = !card.hasClass("is-liked");

    setLiked(card, liked);
    if (liked) {
      burstHeart(card);
    }
  });

  $(".blog-card .media-frame, .blog-card .card-body").on("dblclick", function () {
    const card = $(this).closest(".blog-card");

    setLiked(card, true);
    burstHeart(card);
  });
}

function initScrollReveal() {
  const revealItems = $(".scroll-reveal");

  if (!revealItems.length || !("IntersectionObserver" in window)) {
    revealItems.addClass("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealItems.each(function () {
    observer.observe(this);
  });
}

function initPhishingModule() {
  const trigger = $("#startPhishingSim");
  const offer = $("#phishingOffer");
  const timer = $("#phishingTimer");
  const acceptBtn = $("#acceptPhishingBtn");
  const adviceInline = $("#phishingAdviceInline");
  let remainingSeconds = 300;
  let countdownId = null;

  if (!trigger.length) {
    return;
  }

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function paintTimer() {
    timer.text(formatTime(remainingSeconds));
  }

  function stopCountdown() {
    if (countdownId) {
      clearInterval(countdownId);
      countdownId = null;
    }
  }

  function startCountdown() {
    stopCountdown();
    remainingSeconds = 300;
    paintTimer();

    countdownId = setInterval(function () {
      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        paintTimer();
        stopCountdown();
        return;
      }

      paintTimer();
    }, 1000);
  }

  trigger.on("click", function () {
    adviceInline.addClass("d-none");
    offer.hide().removeClass("d-none").slideDown(250);
    startCountdown();
  });

  acceptBtn.on("click", function () {
    adviceInline.removeClass("d-none");
    const modal = new bootstrap.Modal(document.getElementById("phishingModal"));
    modal.show();
  });
}
