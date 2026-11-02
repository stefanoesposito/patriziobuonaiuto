export function setupMuseum(museum: HTMLElement) {
  const stage = museum.querySelector<HTMLElement>(".museum-stage")!;
  const exhibits = [...museum.querySelectorAll<HTMLElement>(".museum-exhibit")];
  const controls = museum.querySelector<HTMLElement>(".museum-controls")!;
  const toggle = museum.querySelector<HTMLElement>(".museum-toggle")!;
  const stops = [
    ...museum.querySelectorAll<HTMLButtonElement>(".museum-stops button"),
  ];
  const progressBar = museum.querySelector<HTMLElement>(
    ".museum-progress span",
  )!;
  const status = museum.querySelector<HTMLElement>(".museum-status")!;
  const desktop = matchMedia("(min-width: 1024px) and (min-height: 700px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let enhanced = false;
  let stillVisit = false;
  let frame = 0;
  let activeIndex = -1;
  let travel = 1;
  let origin = 0;
  let visible = true;

  function render() {
    frame = 0;
    if (!enhanced || !visible) return;
    const progress = Math.max(
      0,
      Math.min(1, (window.scrollY - origin) / travel),
    );
    const position = progress * (exhibits.length - 1);
    const index = Math.round(position);
    // A perspective camera passes each illuminated wall; native page scroll stays in control.
    const spacing = Math.min(window.innerWidth * 0.52, 760);
    exhibits.forEach((exhibit, i) => {
      const distance = i - position;
      const depth = Math.abs(distance);
      exhibit.style.transform = `translate3d(${distance * spacing}px, ${depth * 12}px, ${-depth * 420}px) rotateY(${-Math.max(-1, Math.min(1, distance)) * 28}deg)`;
      exhibit.style.opacity = String(
        Math.max(0, 1 - Math.max(0, depth - 0.6) * 0.55),
      );
      exhibit.style.visibility = depth > 2.2 ? "hidden" : "visible";
    });
    progressBar.style.transform = `scaleX(${1 + progress * 4})`;
    if (index !== activeIndex) {
      activeIndex = index;
      exhibits.forEach((exhibit, i) => {
        exhibit.inert = i !== index;
      });
      stops.forEach((stop, i) => {
        if (i === index) stop.setAttribute("aria-current", "step");
        else stop.removeAttribute("aria-current");
      });
      status.textContent = `${String(index + 1).padStart(2, "0")} / ${String(exhibits.length).padStart(2, "0")}`;
    }
  }

  function schedule() {
    if (enhanced && visible && !frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    if (!enhanced) return;
    origin = museum.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(1, museum.offsetHeight - stage.offsetHeight);
    schedule();
  }

  function configure() {
    const wasEnhanced = enhanced;
    const rect = museum.getBoundingClientRect();
    const wasInside = wasEnhanced && rect.top <= 0 && rect.bottom > 0;
    enhanced = desktop.matches && !reducedMotion.matches && !stillVisit;
    museum.classList.toggle("museum-enhanced", enhanced);
    controls.hidden = !enhanced;
    toggle.hidden = !desktop.matches || reducedMotion.matches;
    toggle.setAttribute("aria-pressed", String(stillVisit));
    toggle.textContent =
      (stillVisit ? toggle.dataset.immersive : toggle.dataset.still) || "";
    activeIndex = -1;
    if (!enhanced) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      exhibits.forEach((exhibit) => {
        exhibit.removeAttribute("style");
        exhibit.inert = false;
      });
    }
    // Keep the visitor at the room when its height changes, including a live motion-preference change.
    if (wasInside)
      museum.scrollIntoView({ behavior: "instant", block: "start" });
    measure();
  }

  const handlers = stops.map((stop, index) => {
    const handler = () => {
      measure();
      window.scrollTo({
        top: origin + (travel * index) / Math.max(1, exhibits.length - 1),
        behavior: "smooth",
      });
    };
    stop.addEventListener("click", handler);
    return handler;
  });
  const onToggle = () => {
    stillVisit = !stillVisit;
    configure();
  };
  toggle.addEventListener("click", onToggle);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  desktop.addEventListener("change", configure);
  reducedMotion.addEventListener("change", configure);
  let observer: IntersectionObserver | undefined;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
    });
    observer.observe(museum);
  }
  configure();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    desktop.removeEventListener("change", configure);
    reducedMotion.removeEventListener("change", configure);
    toggle.removeEventListener("click", onToggle);
    observer?.disconnect();
    stops.forEach((stop, index) =>
      stop.removeEventListener("click", handlers[index]),
    );
    if (frame) cancelAnimationFrame(frame);
  };
}
