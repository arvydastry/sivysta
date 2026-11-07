/* SiVySta maketas – bendras JS (vanilla). Kiekvienas blokas turi Salient atitikmenį (komentaruose). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SV = window.SV = { reduce: reduce };
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* Toast (demo pranešimai) */
  var toastEl = $('[data-toast]'), toastT;
  SV.toast = function (msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('is-visible');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  };
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-demo]');
    if (a) { e.preventDefault(); SV.toast(a.getAttribute('data-demo') || 'Demo: funkcija bus pilnoje svetainėje'); }
  });

  /* Antraštė: permatoma -> tamsi; slepiasi slenkant žemyn (Salient: Header hide on scroll) */
  var header = $('[data-site-header]'), lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      if (y > 360 && y > lastY + 6 && !doc.body.classList.contains('menu-open') && !header.classList.contains('lm-active')) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 360) header.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* Mega meniu (Salient: Mega Menu; custom: disclosure mygtukas, hover intent, Escape, rodyklės, liečiamas ekranas, video tik atidarius) */
  (function () {
    var header = document.querySelector('[data-lm]');
    if (!header || header.__lm) return;
    header.__lm = true;

    var items = Array.prototype.slice.call(header.querySelectorAll('[data-lm-item]'));
    var mqDesk = window.matchMedia('(min-width: 1181px)');
    var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var OPEN_DELAY = 110, SWITCH_DELAY = 170, CLOSE_DELAY = 280;
    var current = null, mode = null, timer = null, switchT = null, lastPointer = 'mouse', openY = 0, lastScrollT = 0, SCROLL_QUIET = 250;

    function q(sel, el) { return (el || document).querySelector(sel); }
    function qa(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
    function btnOf(item) { return q('[data-lm-toggle]', item); }
    function linksOf(item) { return qa('[data-lm-panel] a[href]', item); }
    function clear() { clearTimeout(timer); timer = null; }

    /* Medija: poster / nuotraukos ir video šaltiniai priskiriami tik pirmą kartą prireikus */
    function hydrate(item) {
      if (item.__h) return; item.__h = true;
      qa('img[data-src]', item).forEach(function (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); });
    }
    function media(item, on) {
      qa('video[data-lm-video]', item).forEach(function (v) {
        if (on && !mqReduce.matches && !saveData) {
          if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); }
          var p = v.play();
          v.onplaying = function () { v.classList.add('is-playing'); };
          if (p && p.catch) p.catch(function () {});
        } else {
          if (!v.paused) v.pause();
        }
      });
    }

    function open(item, how, focus) {
      clear();
      if (!mqDesk.matches) return;
      if (current === item) { if (how === 'pin') mode = 'pin'; if (focus) focusLink(item, focus); return; }
      var switching = !!current;
      if (switching) {
        header.classList.add('lm-switching');
        clearTimeout(switchT);
        switchT = setTimeout(function () { header.classList.remove('lm-switching'); }, 260);
        shut(current);
      }
      hydrate(item);
      q('[data-lm-panel]', item).inert = false;
      item.classList.add('is-open');
      btnOf(item).setAttribute('aria-expanded', 'true');
      header.classList.add('lm-active');
      current = item; mode = how; openY = window.scrollY;
      media(item, true);
      if (focus) focusLink(item, focus);
    }
    function shut(item) {
      var pn = q('[data-lm-panel]', item);
      if (pn.contains(document.activeElement)) btnOf(item).focus({ preventScroll: true });
      item.classList.remove('is-open');
      pn.inert = true;
      btnOf(item).setAttribute('aria-expanded', 'false');
      media(item, false);
    }
    function close(returnFocus) {
      clear();
      if (!current) return;
      var item = current;
      shut(item);
      current = null; mode = null;
      header.classList.remove('lm-active');
      if (returnFocus) btnOf(item).focus();
    }
    function focusLink(item, which) {
      var l = linksOf(item); if (!l.length) return;
      (which === 'last' ? l[l.length - 1] : l[0]).focus();
    }

    items.forEach(function (item) {
      var btn = btnOf(item), link = q('.lm-link', item), panel = q('[data-lm-panel]', item);

      /* Hover intent: tik tikra pelė */
      function intent() {
        clear();
        if (current === item) return;
        if (current) hydrate(item);
        timer = setTimeout(function () { open(item, 'hover'); }, current ? SWITCH_DELAY : OPEN_DELAY);
      }
      item.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || !mqDesk.matches) return;
        /* ką tik slinkta: antraštė „atvažiavo“ po stovinčiu žymekliu, laukiame tikro pelės judesio */
        if (Date.now() - lastScrollT < SCROLL_QUIET) { item.__arm = true; return; }
        intent();
      });
      item.addEventListener('pointermove', function (e) {
        if (!item.__arm || e.pointerType !== 'mouse' || !mqDesk.matches) return;
        item.__arm = false; intent();
      });
      item.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        item.__arm = false;
        clear();
        /* palikus bet kurį punktą (ir tą, per kurį tik praslinkta), pele atidarytas skydelis užsidaro */
        if (current && mode === 'hover') timer = setTimeout(function () { close(false); }, CLOSE_DELAY);
      });
      /* klaviatūros naudojimas skydelyje = užfiksuota būsena (pelės laikmačiai jo neuždaro) */
      panel.addEventListener('focusin', function () { if (current === item) mode = 'pin'; });

      /* Mygtukas: atidaro / uždaro (užfiksuoja) */
      btn.addEventListener('click', function () {
        if (current === item && mode === 'hover') { mode = 'pin'; return; }
        if (current === item) close(false); else open(item, 'pin');
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(item, 'pin', 'first'); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); open(item, 'pin', 'last'); }
      });

      /* Liečiamieji ekranai: pirmas palietimas nuorodą atidaro, antras seka nuoroda */
      link.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; });
      link.addEventListener('click', function (e) {
        if ((lastPointer === 'touch' || lastPointer === 'pen') && current !== item && mqDesk.matches) {
          e.preventDefault(); open(item, 'pin');
        }
        lastPointer = 'mouse';
      });

      /* Klaviatūra skydelyje */
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && current === item) { e.preventDefault(); e.stopPropagation(); close(true); return; }
        if (!panel.contains(e.target)) return;
        var l = linksOf(item), i = l.indexOf(e.target);
        if (i < 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); l[(i + 1) % l.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); l[(i - 1 + l.length) % l.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); l[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); l[l.length - 1].focus(); }
      });
      /* Fokusas paliko punktą: uždaryti (be fokuso grąžinimo) */
      item.addEventListener('focusout', function (e) {
        if (current === item && e.relatedTarget && !item.contains(e.relatedTarget)) close(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current) { var inside = current.contains(document.activeElement); close(inside); }
    });

    /* Kategorijų peržiūra: užvedus / sufokusavus kategoriją, kortelėje rodoma tikro objekto nuotrauka */
    qa('[data-lm-photo-card]', header).forEach(function (card) {
      var alt = q('.lm-media__alt', card), cap = q('[data-lm-cap]', card), def = cap ? cap.textContent : '', t = null, want = null;
      var list = card.parentNode.querySelector('.lm-cats__list');
      if (!alt || !list) return;
      function show(a) {
        clearTimeout(t);
        want = a ? a.getAttribute('data-lm-photo') : null;
        t = setTimeout(function () {
          if (!a) { alt.classList.remove('is-shown'); if (cap) cap.textContent = def; return; }
          var src = a.getAttribute('data-lm-photo'), txt = a.getAttribute('data-lm-cap') || def;
          if (alt.getAttribute('src') === src) { alt.classList.add('is-shown'); if (cap) cap.textContent = txt; return; }
          alt.classList.remove('is-shown');
          var img = new Image();
          img.onload = function () {
            if (want !== src) return; /* jau užvesta ant kitos kategorijos arba palikta */
            alt.src = src; alt.classList.add('is-shown'); if (cap) cap.textContent = txt;
          };
          img.src = src;
        }, 60);
      }
      qa('a[data-lm-photo]', list).forEach(function (a) {
        a.addEventListener('pointerenter', function () { show(a); });
        a.addEventListener('focus', function () { show(a); });
      });
      list.addEventListener('pointerleave', function () { show(null); });
      list.addEventListener('focusout', function (e) { if (!list.contains(e.relatedTarget)) show(null); });
    });

    /* Paspaudimas už meniu ribų */
    document.addEventListener('pointerdown', function (e) {
      if (current && !current.contains(e.target)) close(false);
    });
    /* Slenkant puslapį skydelis užsidaro */
    window.addEventListener('scroll', function () {
      lastScrollT = Date.now();
      if (current && Math.abs(window.scrollY - openY) > 48) close(false);
    }, { passive: true });
    /* Perėjus į mobilų meniu */
    var onMq = function () { if (!mqDesk.matches) close(false); };
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', onMq); else mqDesk.addListener(onMq);
    /* Skirtukas paslėptas: sustabdyti video */
    document.addEventListener('visibilitychange', function () { if (current) media(current, !document.hidden); });
  })();

  /* Mobilus meniu */
  var mmenu = $('[data-mobile-menu]'), toggle = $('[data-menu-toggle]');
  function setMenu(open) {
    if (!mmenu) return;
    mmenu.classList.toggle('is-open', open); mmenu.setAttribute('aria-hidden', String(!open));
    doc.body.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (open) { var f = $('[data-menu-close]', mmenu); f && f.focus(); } else if (toggle) toggle.focus();
  }
  toggle && toggle.addEventListener('click', function () { setMenu(true); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLightbox(); } });

  /* Teksto skaidymas žodžiais (Salient: Animated Text / Split Line Heading) */
  $$('[data-split]').forEach(function (el) {
    if (reduce) return;
    var nodes = Array.prototype.slice.call(el.childNodes), i = 0;
    el.innerHTML = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(doc.createTextNode(' ')); return; }
          var w = doc.createElement('span'); w.className = 'w';
          var inner = doc.createElement('span'); inner.className = 'w__in'; inner.textContent = part; inner.style.setProperty('--d', (i++ * 0.045) + 's');
          w.appendChild(inner); el.appendChild(w);
        });
      } else if (n.nodeType === 1 && n.hasAttribute('data-split-keep')) {
        el.appendChild(n);
      } else if (n.nodeType === 1) {
        var wrap = n.cloneNode(false); wrap.innerHTML = '';
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { wrap.appendChild(doc.createTextNode(' ')); return; }
          var w = doc.createElement('span'); w.className = 'w';
          var inner = doc.createElement('span'); inner.className = 'w__in'; inner.textContent = part; inner.style.setProperty('--d', (i++ * 0.045) + 's');
          w.appendChild(inner); wrap.appendChild(w);
        });
        el.appendChild(wrap);
      }
    });
  });

  /* Stagger: vaikai gauna augančią delsą */
  $$('[data-stagger]').forEach(function (p) {
    var step = parseFloat(p.getAttribute('data-stagger')) || 0.09;
    $$(':scope > [data-reveal], :scope > * > [data-reveal]', p).forEach(function (c, i) { c.style.setProperty('--d', (i * step) + 's'); });
  });

  /* Reveal (IntersectionObserver), skaitikliai (Milestone), procesų lipni medija */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; el.classList.add('is-in'); io.unobserve(el);
      if (el.hasAttribute('data-count')) count(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }) : null;
  $$('[data-reveal], [data-split], [data-mask], [data-count]').forEach(function (el) {
    if (io && !reduce) io.observe(el); else { el.classList.add('is-in'); if (el.hasAttribute('data-count')) count(el, true); }
  });
  function count(el, instant) {
    var target = parseFloat(el.getAttribute('data-count')), sfx = el.getAttribute('data-suffix') || '', dur = 1600, start = null;
    var num = $('.num', el) || el;
    function fmt(v) { return (el.getAttribute('data-plain') != null ? String(v) : v.toLocaleString('lt-LT')); }
    if (instant || reduce) { num.textContent = fmt(target); return; }
    function tick(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      num.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Parallax (Salient: Row/Image parallax) */
  var px = $$('[data-parallax]');
  if (px.length && !reduce) {
    var update = function () {
      var vh = window.innerHeight;
      px.forEach(function (el) {
        var r = (el.closest('[data-parallax-ref]') || el.parentElement).getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (mid * k).toFixed(1) + 'px,0) scale(' + (1 + k * 1.2) + ')';
      });
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update); update();
  }

  /* 3D tilt kortelėms (Salient: Fancy Box – Parallax Hover) */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* Judanti juosta: dubliuojame turinį begaliniam ciklui (Salient: Scrolling Text) */
  $$('.marquee__track').forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* Lipni medija procesui (Salient: Sticky Content Sections) */
  $$('[data-process]').forEach(function (proc) {
    var steps = $$('.step', proc), imgs = $$('.process__media > img, .process__media > video', proc);
    if (!steps.length || !imgs.length || !('IntersectionObserver' in window)) return;
    proc.classList.add('is-tracking');
    var cur = 0, inView = false, media = $('.process__media', proc);
    var sd = !!(navigator.connection && navigator.connection.saveData), wide = window.matchMedia('(min-width: 901px)');
    function sync() {
      imgs.forEach(function (im, j) {
        if (im.tagName !== 'VIDEO') return;
        if (j === cur && inView && wide.matches && !reduce && !sd) { im.play().catch(function () {}); } else { im.pause(); }
      });
    }
    function activate(i) {
      cur = i;
      steps.forEach(function (s, j) { s.classList.toggle('is-active', i === j); });
      imgs.forEach(function (im, j) { im.classList.toggle('is-active', i === j); });
      sync();
    }
    if (media) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }, { rootMargin: '200px 0px' }).observe(media);
    activate(0);
    var o = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(steps.indexOf(en.target)); });
    }, { rootMargin: '-40% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { o.observe(s); });
  });

  /* Projektų filtras (Salient: Post Loop Builder / Portfolio filter) */
  $$('[data-filter-root]').forEach(function (rootEl) {
    var btns = $$('[data-filter]', rootEl), cards = $$('.pcard', rootEl), empty = $('.empty', rootEl);
    btns.forEach(function (b) {
      var key = b.getAttribute('data-filter'), n = $('.n', b);
      if (n) n.textContent = key === '*' ? cards.length : cards.filter(function (c) { return c.getAttribute('data-cat') === key; }).length;
    });
    function apply(key, push) {
      btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter') === key); });
      var shown = 0;
      cards.forEach(function (c, i) {
        var show = key === '*' || c.getAttribute('data-cat') === key;
        c.classList.toggle('is-hidden', !show);
        if (show) { shown++; c.style.setProperty('--d', (Math.min(shown, 9) * 0.05) + 's'); c.classList.remove('is-in'); void c.offsetWidth; c.classList.add('is-in'); }
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (push && history.replaceState) history.replaceState(null, '', key === '*' ? location.pathname : '?kat=' + key);
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter'), true); }); });
    var q = new URLSearchParams(location.search).get('kat');
    if (q && btns.some(function (b) { return b.getAttribute('data-filter') === q; })) apply(q, false);
  });

  /* Lightbox (Salient: Image Gallery lightbox) */
  var lb = $('[data-lightbox-root]'), lbImg = $('[data-lightbox-img]'), lbCap = $('[data-lightbox-caption]'), gallery = [], idx = 0, lastFocus;
  function openLightbox(items, i, origin) {
    if (!lb) return;
    gallery = items; idx = i; lastFocus = origin; render();
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); doc.body.style.overflow = 'hidden';
    $('[data-lightbox-close]', lb).focus();
  }
  function render() {
    lbImg.src = gallery[idx].src; lbImg.alt = gallery[idx].cap || ''; lbCap.textContent = gallery[idx].cap + (gallery.length > 1 ? ' · ' + (idx + 1) + ' / ' + gallery.length : '');
    $('[data-lightbox-prev]', lb).disabled = idx === 0; $('[data-lightbox-next]', lb).disabled = idx === gallery.length - 1;
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); doc.body.style.overflow = '';
    lastFocus && lastFocus.focus();
  }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lightbox]');
    if (!a) return;
    e.preventDefault();
    var cap = a.getAttribute('data-lightbox'), items = [], k = 0, v;
    while ((v = a.getAttribute('data-gallery-' + k)) !== null) { items.push({ src: v, cap: cap }); k++; }
    if (!items.length) items.push({ src: a.getAttribute('href'), cap: cap });
    openLightbox(items, 0, a);
  });
  if (lb) {
    $('[data-lightbox-close]', lb).addEventListener('click', closeLightbox);
    $('[data-lightbox-prev]', lb).addEventListener('click', function () { if (idx > 0) { idx--; render(); } });
    $('[data-lightbox-next]', lb).addEventListener('click', function () { if (idx < gallery.length - 1) { idx++; render(); } });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft' && idx > 0) { idx--; render(); }
      if (e.key === 'ArrowRight' && idx < gallery.length - 1) { idx++; render(); }
    });
  }

  /* Formos: demo – niekur nesiunčia */
  $$('form[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      f.classList.add('is-sent'); f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      SV.toast('Demo: užklausa nebuvo išsiųsta. Pilnoje svetainėje ją gaus sivysta@sivysta.lt');
    });
  });

  /* Video turinyje: groja tik kai matomas ekrane (taupo resursus, Salient: Self Hosted Video autoplay) */
  var avs = $$('video[data-autoplay]');
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var desktopMq = window.matchMedia('(min-width: 901px)');
  avs.forEach(function (v) { v.addEventListener('playing', function () { v.classList.add('is-playing'); }); });
  if (avs.length && 'IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        var allowed = v.hasAttribute('data-user-played') || (!reduce && !saveData && !v.hasAttribute('data-user-paused') &&
          (!v.hasAttribute('data-autoplay-desktop') || desktopMq.matches));
        if (en.isIntersecting && allowed) { v.play().catch(function () {}); } else { v.pause(); }
      });
    }, { rootMargin: '120px 0px' });
    avs.forEach(function (v) { vo.observe(v); });
    var dOnly = avs.filter(function (v) { return v.hasAttribute('data-autoplay-desktop'); });
    if (dOnly.length) {
      var reobs = function () { dOnly.forEach(function (v) { vo.unobserve(v); vo.observe(v); }); };
      if (desktopMq.addEventListener) desktopMq.addEventListener('change', reobs); else if (desktopMq.addListener) desktopMq.addListener(reobs);
    }
  }

  /* Įžangos video scena išsiplečia slenkant (Salient: Row Background Layer Animation – Clip Path Inset, Scroll Position).
     Tik ≥ 901 px ir be reduced motion; slinkties klausytojas veikia tik kol scena šalia ekrano. */
  $$('[data-ix-expand]').forEach(function (rootEl) {
    var stage = $('[data-ix-stage]', rootEl);
    if (!stage || !('IntersectionObserver' in window)) return;
    var on = false, near = false, queued = false;
    function measure() {
      queued = false;
      if (!on) return;
      var r = stage.getBoundingClientRect(), vh = window.innerHeight;
      var start = vh * 0.92, end = vh * 0.1;
      var p = Math.max(0, Math.min(1, (start - r.top) / (start - end)));
      p = p * p * (3 - 2 * p);
      stage.style.setProperty('--ix-p', p.toFixed(4));
      stage.classList.toggle('is-moving', p > 0 && p < 1);
    }
    function request() { if (on && near && !queued) { queued = true; requestAnimationFrame(measure); } }
    function setup() {
      on = desktopMq.matches && !reduce;
      rootEl.classList.toggle('is-expanding', on);
      if (!on) { stage.style.removeProperty('--ix-p'); stage.classList.remove('is-moving'); }
      else { measure(); }
    }
    new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (near) request(); else measure(); }, { rootMargin: '50% 0px' }).observe(stage);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    if (desktopMq.addEventListener) desktopMq.addEventListener('change', setup);
    setup();
  });

  /* Vaizdo įrašas hero: pauzė / paleidimas */
  $$('[data-video-toggle]').forEach(function (b) {
    var v = $(b.getAttribute('data-video-toggle'));
    if (!v) return;
    var lp = b.getAttribute('data-label-pause') || 'Sustabdyti vaizdo įrašą', ll = b.getAttribute('data-label-play') || 'Paleisti vaizdo įrašą';
    function sync() { var p = v.paused; b.classList.toggle('is-paused', p); b.setAttribute('aria-label', p ? ll : lp); }
    v.addEventListener('play', sync); v.addEventListener('pause', sync);
    if (reduce || saveData) { v.pause(); v.removeAttribute('autoplay'); }
    sync();
    b.addEventListener('click', function () {
      if (v.paused) { v.removeAttribute('data-user-paused'); v.setAttribute('data-user-played', ''); v.play().catch(function () {}); }
      else { v.removeAttribute('data-user-played'); v.setAttribute('data-user-paused', ''); v.pause(); }
    });
  });

  /* Slapukų juosta (demo, be išsaugojimo tarp sesijų) */
  var cookie = $('[data-cookie]');
  if (cookie) {
    var seen = false; try { seen = sessionStorage.getItem('sv-cookie'); } catch (e) {}
    if (!seen) setTimeout(function () { cookie.classList.add('is-visible'); }, 1800);
    $$('[data-cookie-accept], [data-cookie-decline]', cookie).forEach(function (b) {
      b.addEventListener('click', function () { cookie.classList.remove('is-visible'); try { sessionStorage.setItem('sv-cookie', '1'); } catch (e) {} });
    });
  }

  /* Puslapio submeniu: aktyvi sekcija */
  var subLinks = $$('.page-submenu a[href^="#"]');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var secs = subLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    secs.forEach(function (s) { so.observe(s); });
  }

  /* Užklausos formoje iš anksto parinkta paslauga (?domina=...) */
  var domina = new URLSearchParams(location.search).get('domina'), sel = $('select[name="paslauga"]');
  if (domina && sel) { Array.prototype.forEach.call(sel.options, function (o) { if (o.value === domina || o.text === domina) sel.value = o.value; }); }
})();
