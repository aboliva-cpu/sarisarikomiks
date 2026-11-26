const menu = document.getElementById("overlay-nav-menu");

document.querySelectorAll("[data-toggle-menu]").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    if (!menu) return;
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });
});

document.querySelectorAll("[data-comic-carousel]").forEach((carousel) => {
  const comics = Array.from(carousel.querySelectorAll(".comic-gallery figure"));
  const previousButton = carousel.querySelector("[data-carousel-previous]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const mobileQuery = window.matchMedia("(max-width: 640px)");
  const narrowMobileQuery = window.matchMedia("(max-width: 480px)");
  let firstVisible = 0;

  const getVisibleCount = () => {
    if (narrowMobileQuery.matches) return 1;
    return mobileQuery.matches ? 2 : 3;
  };

  const getSelectedFilters = () =>
    Array.from(
      document.querySelectorAll(".comic-filter input[type='checkbox']:checked")
    ).map((input) => input.value);

  const updateCarousel = () => {
    const visibleCount = getVisibleCount();
    const selectedFilters = getSelectedFilters();
    const matchingComics = comics.filter((comic) => {
      const categories = (comic.dataset.category || "").split(" ");
      return (
        selectedFilters.length === 0 ||
        selectedFilters.some((category) => categories.includes(category))
      );
    });

    const lastFirstVisible = Math.max(
      0,
      matchingComics.length - visibleCount
    );
    firstVisible = Math.min(firstVisible, lastFirstVisible);

    matchingComics.forEach((comic) => {
      comic.hidden = true;
    });

    matchingComics
      .slice(firstVisible, firstVisible + visibleCount)
      .forEach((comic) => {
        comic.hidden = false;
      });

    comics.forEach((comic) => {
      if (!matchingComics.includes(comic)) comic.hidden = true;
    });

    previousButton.disabled = firstVisible === 0;
    nextButton.disabled =
      matchingComics.length <= visibleCount ||
      firstVisible >= lastFirstVisible;
  };

  previousButton.addEventListener("click", () => {
    firstVisible = Math.max(0, firstVisible - getVisibleCount());
    updateCarousel();
  });

  nextButton.addEventListener("click", () => {
    firstVisible = Math.min(
      firstVisible + getVisibleCount(),
      Math.max(0,
        comics.filter((comic) => {
          const categories = (comic.dataset.category || "").split(" ");
          const selectedFilters = getSelectedFilters();
          return (
            selectedFilters.length === 0 ||
            selectedFilters.some((category) => categories.includes(category))
          );
        }).length - getVisibleCount()
      )
    );
    updateCarousel();
  });

  mobileQuery.addEventListener("change", updateCarousel);
  narrowMobileQuery.addEventListener("change", updateCarousel);
  window.addEventListener("comic-filter-change", () => {
    firstVisible = 0;
    updateCarousel();
  });
  updateCarousel();
});

const comicViewButtons = Array.from(
  document.querySelectorAll("[data-comic-view]")
);
const comicSections = Array.from(
  document.querySelectorAll("[data-comic-type]")
);

comicViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.comicView;
    comicViewButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    comicSections.forEach((section) => {
      section.hidden = section.dataset.comicType !== type;
    });
  });
});

document
  .querySelectorAll(".comic-filter input[type='checkbox']")
  .forEach((input) => {
    input.addEventListener("change", () => {
      window.dispatchEvent(new Event("comic-filter-change"));
    });
  });

const creatorSearch = document.querySelector("#creator-search");
const creatorRoleFilter = document.querySelector("#creator-role-filter");
const creatorCards = Array.from(document.querySelectorAll(".creator-card"));
const creatorEmptyState = document.querySelector(".creator-empty-state");

if (creatorSearch && creatorRoleFilter && creatorEmptyState) {
  const filterCreators = () => {
    const query = creatorSearch.value.trim().toLowerCase();
    const selectedRole = creatorRoleFilter.value;
    let visibleCreators = 0;

    creatorCards.forEach((card) => {
      const matchesSearch = card.textContent.toLowerCase().includes(query);
      const roles = (card.dataset.roles || "").split(/\s+/);
      const matchesRole =
        selectedRole === "all" || roles.includes(selectedRole);
      const isVisible = matchesSearch && matchesRole;

      card.hidden = !isVisible;
      if (isVisible) visibleCreators += 1;
    });

    creatorEmptyState.hidden = visibleCreators > 0;
  };

  creatorSearch.addEventListener("input", filterCreators);
  creatorRoleFilter.addEventListener("change", filterCreators);
}
