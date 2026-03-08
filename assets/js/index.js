(function () {
  document.documentElement.classList.add('js');
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
// ============ Legal nav — surlignage de section active ============
(function () {
  var navLinks = document.querySelectorAll('.legal__nav-link');
  if (!navLinks.length) return;

  var targets = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    var el = document.getElementById(id);
    if (el) targets.push({ el: el, link: link });
  });

  var ob = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('legal__nav-link--on'); });
        var match = targets.find(function (t) { return t.el === entry.target; });
        if (match) match.link.classList.add('legal__nav-link--on');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

  targets.forEach(function (t) { ob.observe(t.el); });
})();

// ============ Soumission multi-&eacute;tapes ============
(function () {
  var form = document.getElementById('soumission-form');
  if (!form) return;

  var success      = document.getElementById('sm-success');
  var recap        = document.getElementById('sm-recap');
  var radioOui     = document.getElementById('site-oui');
  var radioNon     = document.getElementById('site-non');
  var urlReveal    = document.getElementById('sm-url-reveal');
  var btnPrev      = document.getElementById('sm-prev');
  var btnNext      = document.getElementById('sm-next');
  var btnSubmit    = document.getElementById('sm-submit');
  var stepEls      = document.querySelectorAll('.sm__step[data-step]');
  var emailError   = document.getElementById('sm-email-error');
  var consentError = document.getElementById('sm-consent-error');

  var total   = 4;
  var current = 1;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function getPanel(n) {
    return document.getElementById('sm-step-' + n);
  }

  function updateProgress() {
    stepEls.forEach(function (s) {
      var n = parseInt(s.getAttribute('data-step'), 10);
      s.classList.toggle('sm__step--on', n <= current);
    });
  }

  function showStep(n) {
    for (var i = 1; i <= total; i++) {
      var p = getPanel(i);
      if (p) p.classList.toggle('sm__panel--on', i === n);
    }
    if (btnPrev)   btnPrev.style.visibility = n === 1 ? 'hidden' : 'visible';
    if (btnNext)   btnNext.style.display    = n < total ? 'inline-flex' : 'none';
    if (btnSubmit) btnSubmit.style.display  = n === total ? 'inline-flex' : 'none';
    updateProgress();
  }

  function showMsg(el, on) {
    if (el) el.classList.toggle('sm__error-msg--on', on);
  }

  function validatePanel(n) {
    var panel = getPanel(n);
    if (!panel) return true;
    var valid = true;

    panel.querySelectorAll('[required]').forEach(function (input) {
      var empty = false;

      if (input.type === 'checkbox') {
        if (!input.checked) empty = true;
        if (input.id === 'sm-consent') showMsg(consentError, empty);
      } else if (input.type === 'radio') {
        var group = panel.querySelectorAll('input[name="' + input.name + '"]');
        var anyChecked = Array.prototype.some.call(group, function (i) { return i.checked; });
        if (!anyChecked) empty = true;
      } else {
        empty = !input.value.trim();
      }

      if (input.type === 'email' && !empty) {
        if (!emailRe.test(input.value.trim())) {
          input.classList.add('sm__input--error');
          showMsg(emailError, true);
          valid = false;
          return;
        }
      }

      if (empty) {
        input.classList.add('sm__input--error');
        valid = false;
      }
    });

    if (!valid) {
      var first = panel.querySelector('.sm__input--error, .sm__error-msg--on');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  // R&eacute;v&eacute;lation du champ URL (Oui, j&rsquo;en ai un)
  if (radioOui && urlReveal) {
    radioOui.addEventListener('change', function () {
      urlReveal.classList.add('sm__url-reveal--on');
    });
  }
  if (radioNon && urlReveal) {
    radioNon.addEventListener('change', function () {
      urlReveal.classList.remove('sm__url-reveal--on');
    });
  }

  // Effacer les erreurs &agrave; la saisie
  form.addEventListener('input', function (e) {
    e.target.classList.remove('sm__input--error');
    if (e.target.id === 'sm-email') showMsg(emailError, false);
  });
  form.addEventListener('change', function (e) {
    e.target.classList.remove('sm__input--error');
    if (e.target.id === 'sm-consent') showMsg(consentError, false);
  });

  // Bouton Suivant
  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (!validatePanel(current)) return;
      current++;
      showStep(current);
      form.closest('.sm__wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Bouton Pr&eacute;c&eacute;dent
  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      if (current > 1) {
        current--;
        showStep(current);
        form.closest('.sm__wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Soumission finale
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validatePanel(current)) return;

    var name     = form.elements['name'].value.trim();
    var email    = form.elements['email'].value.trim();
    var typeEl   = form.elements['site_type'];
    var siteType = typeEl.options[typeEl.selectedIndex].text;
    var budgetEl = form.elements['budget'];
    var budget   = budgetEl.options[budgetEl.selectedIndex].text;
    var delaiEl  = form.elements['deadline'];
    var delai    = delaiEl.options[delaiEl.selectedIndex].text;

    var checked  = form.querySelectorAll('input[name="features[]"]:checked');
    var features = [];
    checked.forEach(function (cb) {
      var label = cb.parentNode.querySelector('.sm__check-text');
      if (label) features.push(label.textContent.trim());
    });

    var html = '';
    html += '<p><strong>Nom&nbsp;:</strong> ' + name + '</p>';
    html += '<p><strong>Courriel&nbsp;:</strong> ' + email + '</p>';
    html += '<p><strong>Type de projet&nbsp;:</strong> ' + siteType + '</p>';
    html += '<p><strong>Budget&nbsp;:</strong> ' + budget + '</p>';
    html += '<p><strong>D&eacute;lai&nbsp;:</strong> ' + delai + '</p>';
    if (features.length) {
      html += '<p><strong>Fonctionnalit&eacute;s&nbsp;:</strong> ' + features.join(', ') + '</p>';
    }

    if (recap) recap.innerHTML = html;

    form.style.display = 'none';
    if (success) {
      success.classList.add('sm__success--on');
      success.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Initialisation
  showStep(1);
})();

// ============ Carrousel témoignages ============
(function () {
  var stage = document.querySelector('.testi__stage');
  if (!stage) return;

  var cards    = Array.prototype.slice.call(stage.querySelectorAll('.testi__card'));
  var dots     = Array.prototype.slice.call(document.querySelectorAll('.testi__dot'));
  var tPrev    = document.querySelector('.testi__btn--prev');
  var tNext    = document.querySelector('.testi__btn--next');
  var current  = 0;
  var total    = cards.length;
  var animating = false;

  function goTo(next, dir) {
    if (animating || next === current) return;
    animating = true;

    var incoming = cards[next];
    var outgoing = cards[current];

    // Positionner la carte entrante du bon côté
    incoming.style.transition = 'none';
    incoming.style.transform  = 'translateX(' + (dir > 0 ? '100%' : '-100%') + ')';
    incoming.style.opacity    = '1';
    incoming.setAttribute('aria-hidden', 'false');

    // Forcer le reflow
    incoming.getBoundingClientRect();

    // Animer les deux cartes
    var dur = '0.5s';
    var ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    outgoing.style.transition = 'transform ' + dur + ' ' + ease + ', opacity ' + dur + ' ' + ease;
    outgoing.style.transform  = 'translateX(' + (dir > 0 ? '-100%' : '100%') + ')';
    outgoing.style.opacity    = '0';

    incoming.style.transition = 'transform ' + dur + ' ' + ease + ', opacity ' + dur + ' ' + ease;
    incoming.style.transform  = 'translateX(0)';

    dots.forEach(function (d, i) {
      d.classList.toggle('testi__dot--on', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });

    current = next;

    setTimeout(function () {
      outgoing.setAttribute('aria-hidden', 'true');
      animating = false;
    }, 520);
  }

  // Init : positionner toutes les cartes sauf la première
  cards.forEach(function (c, i) {
    if (i !== 0) {
      c.style.transform = 'translateX(100%)';
      c.style.opacity   = '0';
      c.setAttribute('aria-hidden', 'true');
    }
  });

  if (tPrev) tPrev.addEventListener('click', function () {
    goTo((current - 1 + total) % total, 1);
  });
  if (tNext) tNext.addEventListener('click', function () {
    goTo((current + 1) % total, -1);
  });

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      var idx = parseInt(d.getAttribute('data-index'));
      goTo(idx, idx > current ? 1 : -1);
    });
  });
})();
// ============ Contact — r&eacute;v&eacute;lation du formulaire + soumission ============
(function () {
  var opt1 = document.getElementById('ct-opt1');
  var panel = document.getElementById('ct-form-panel');
  if (!opt1 || !panel) return;

  opt1.addEventListener('click', function () {
    if (!panel.classList.contains('ct__form-panel--on')) {
      panel.classList.add('ct__form-panel--on');
      panel.setAttribute('aria-hidden', 'false');
      opt1.setAttribute('aria-expanded', 'true');
      opt1.closest('.ct-choose__card').classList.add('ct-choose__card--selected');
      setTimeout(function () {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  });

  var form = panel.querySelector('.ct__form');
  if (!form) return;

  var btn = form.querySelector('.ct__submit');
  var btnText = form.querySelector('.ct__submit-text');
  var btnIcon = form.querySelector('.ct__submit-icon');
  var status = form.querySelector('.ct__status');
  var fields = form.querySelectorAll('.ct__field');
  var formTitle = form.querySelector('.ct__form-title');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      if (!input.value.trim()) {
        input.classList.add('ct__input--error');
        valid = false;
      } else {
        input.classList.remove('ct__input--error');
      }
    });
    if (!valid) return;

    btn.disabled = true;
    btn.classList.add('ct__submit--sending');
    btnText.textContent = 'Envoi en cours\u2026';
    btnIcon.style.opacity = '0.2';

    setTimeout(function () {
      if (formTitle) formTitle.style.display = 'none';
      fields.forEach(function (f) { f.style.display = 'none'; });
      btn.style.display = 'none';
      if (status) status.classList.add('ct__status--on');
    }, 1500);
  });

  form.addEventListener('input', function (e) {
    e.target.classList.remove('ct__input--error');
  });
})();