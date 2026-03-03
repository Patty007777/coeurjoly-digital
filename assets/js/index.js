(function () {
  var tb = document.querySelector('.topbar');
  var toggle = document.querySelector('.topbar__toggle');
  var nav = document.querySelector('.topbar__nav');

  window.addEventListener('scroll', function () {
    tb.classList.toggle('topbar--solid', window.scrollY > 60);
  });

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('topbar__nav--open');
      toggle.classList.toggle('topbar__toggle--open');
      var isOpen = nav.classList.contains('topbar__nav--open');
      toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('.topbar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('topbar__nav--open');
        toggle.classList.remove('topbar__toggle--open');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var els = document.querySelectorAll('.rv');
  var ob = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var p = e.target.closest('.about__grid, .adv__grid, .container, .row');
        if (p) {
          var s = p.querySelectorAll('.rv');
          var i = Array.prototype.indexOf.call(s, e.target);
          e.target.style.transitionDelay = (i * 0.1) + 's';
        }
        e.target.classList.add('rv--on');
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  els.forEach(function (el) {
    ob.observe(el);
  });

  var nums = document.querySelectorAll('[data-count]');
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var target = parseInt(e.target.getAttribute('data-count'));
        var suffix = e.target.getAttribute('data-suffix') || '%';
        var dur = 1400;
        var start = performance.now();

        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 2.5);
          e.target.textContent = Math.round(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        co.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(function (n) {
    co.observe(n);
  });
})();