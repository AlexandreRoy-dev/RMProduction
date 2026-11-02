(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  root.classList.add("js");

  var menu = document.querySelector(".menu");
  var nav = document.getElementById("site-nav");
  if (menu && nav) {
    menu.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var head = document.querySelector(".top");
  function onScroll() {
    if (head) head.classList.toggle("is-solid", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function armVideo() {
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save) return;
    var video = document.getElementById("hero-video");
    if (!video || video.dataset.armed) return;
    video.dataset.armed = "1";
    var base = "/maquettes/signature/media/";
    var narrow = window.matchMedia("(max-width: 768px)").matches;
    if (narrow) {
      video.src = base + "hero-mobile.mp4";
    } else {
      var webm = document.createElement("source");
      webm.src = base + "hero.webm";
      webm.type = "video/webm";
      var mp4 = document.createElement("source");
      mp4.src = base + "hero.mp4";
      mp4.type = "video/mp4";
      video.appendChild(webm);
      video.appendChild(mp4);
    }
    video.addEventListener("loadeddata", function () { video.classList.add("is-ready"); }, { once: true });
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }
  if (document.readyState === "complete") armVideo();
  else window.addEventListener("load", function () { window.requestAnimationFrame(armVideo); });

  var veil = document.querySelector(".veil");
  document.querySelectorAll("a[data-sig]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (reduce || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      if (veil) veil.classList.add("is-on");
      window.setTimeout(function () { window.location.href = href; }, 420);
    });
  });

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  document.querySelectorAll(".line").forEach(function (line) {
    if (line.querySelector("i")) return;
    var text = line.textContent;
    line.textContent = "";
    var inner = document.createElement("i");
    inner.textContent = text;
    line.appendChild(inner);
  });
  root.classList.add("motion");

  if (window.Lenis && fine) {
    var lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", window.ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  gsap.utils.toArray(".line > i").forEach(function (node) {
    gsap.to(node, {
      y: 0, duration: 1.05, ease: "power3.out",
      scrollTrigger: { trigger: node, start: "top 86%" }
    });
  });
  gsap.utils.toArray(".reveal").forEach(function (node) {
    gsap.to(node, {
      opacity: 1, y: 0, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: node, start: "top 88%" }
    });
  });
  gsap.utils.toArray(".clip img").forEach(function (img) {
    gsap.to(img, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power2.out",
      scrollTrigger: { trigger: img, start: "top 80%" }
    });
  });
  gsap.utils.toArray(".draw").forEach(function (rule) {
    gsap.to(rule, {
      scaleX: 1, duration: 1.1, ease: "power2.out",
      scrollTrigger: { trigger: rule, start: "top 88%" }
    });
  });
  gsap.utils.toArray("[data-parallax]").forEach(function (node) {
    gsap.to(node, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  var heroMedia = document.querySelector(".hero-media");
  var heroTitle = document.querySelector(".hero h1");
  if (heroMedia) {
    gsap.fromTo(heroMedia, { scale: 1 }, {
      scale: 1.08, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }
  if (heroTitle) {
    gsap.to(heroTitle, {
      y: 36, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  if (fine) {
    root.classList.add("has-cursor");
    var dot = document.querySelector(".cursor");
    if (dot) {
      window.addEventListener("mousemove", function (event) {
        dot.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
      }, { passive: true });
    }
  }
})();
