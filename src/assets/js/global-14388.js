(function() {
  const init = () => {
    const mobileMenuBtns = document.querySelectorAll('.mobile-menu-btn');
    mobileMenuBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const nav = btn.closest('nav');
        const mobileMenu = nav.querySelector('.mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.toggle('hidden');
        }
      });
    });

    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
              mobileMenu.classList.add('hidden');
            }
          }
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();