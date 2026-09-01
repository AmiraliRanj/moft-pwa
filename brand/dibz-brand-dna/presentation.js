const slides = Array.from(document.querySelectorAll(".slide"));
const currentSlide = document.querySelector("#current-slide");
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");

let activeIndex = 0;
const persianNumber = new Intl.NumberFormat("fa-IR", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateDeck(index) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  currentSlide.textContent = persianNumber.format(activeIndex + 1);
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  document.title = `دیبز — هویت برند · ${persianNumber.format(activeIndex + 1)}`;
}

function goToSlide(index) {
  const targetIndex = Math.max(0, Math.min(slides.length - 1, index));
  slides[targetIndex].scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        updateDeck(slides.indexOf(entry.target));
      }
    });
  },
  { threshold: 0.55 },
);

slides.forEach((slide) => observer.observe(slide));
previousButton.addEventListener("click", () => goToSlide(activeIndex - 1));
nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));

document.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex + 1);
  }

  if (["ArrowRight", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToSlide(slides.length - 1);
  }
});

updateDeck(0);
