(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var head = document.querySelector(".top");
  function onScroll() {
    if (!head) return;
    head.classList.toggle("is-solid", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  var nodes = document.querySelectorAll(".reveal, .draw");
  if (reduce) {
    nodes.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  nodes.forEach(function (el) { io.observe(el); });
})();
