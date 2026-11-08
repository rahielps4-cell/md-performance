/* ==========================================================================
   MD PERFORMANCE — main.js
   Vanilla JS, geen libraries. Onderdelen:
    0. Helpers                       9. Ticker op scrollsnelheid
    1. Intro-loader                 10. Magnetische knoppen         
    2. Gordijn-overgang              11. Klik-rimpel
    3. Header + mobiel menu          12. (vervallen)          
    4. Koppen woord-voor-woord       13. Prijskaarten kantelen
    5. Scroll-reveals                14. Galerij: reels-feed
    6. Optellende cijfers            15. Galerij-lightbox (oude grid)
    7. Scroll-loop (parallax, hero,  16. Contact: WhatsApp-composer
       vullende tekst, pin, footer)  17. Kleine extra's
    8. Horizontale fotoreeks
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 0. Helpers ---------------------------------------------- */
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var store = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* privémodus */ } }
  };
  var vh = window.innerHeight, vw = window.innerWidth;
  window.addEventListener('resize', function () { vh = window.innerHeight; vw = window.innerWidth; }, { passive: true });

  /* ---------- 1. Intro-loader ------------------------------------------ */
  if (root.classList.contains('intro')) {
    store.set('mdIntro', '1');
    if (reduceMotion) {
      root.classList.remove('intro');
    } else {
      root.classList.add('loading');
      var loader = document.createElement('div');
      loader.className = 'loader';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML =
        '<div class="loader__inner"><img class="loader__logo" src="images/logo.png" alt="" width="560" height="199">' +
        '<span class="loader__bar"><i></i></span><span class="loader__tag">Train · Develop · Perform</span></div>' +
        '<span class="loader__count">0</span>';
      document.body.appendChild(loader);
      root.classList.remove('intro');
      var lCount = $('.loader__count', loader), lBar = $('.loader__bar i', loader), lStart = null;
      var lStep = function (ts) {
        if (!lStart) lStart = ts;
        var p = Math.min((ts - lStart) / 1350, 1), e = 1 - Math.pow(1 - p, 3);
        lCount.textContent = Math.round(e * 100);
        lBar.style.transform = 'scaleX(' + e + ')';
        if (p < 1) { window.requestAnimationFrame(lStep); return; }
        setTimeout(function () {
          loader.classList.add('is-done');
          root.classList.remove('loading');
          setTimeout(function () { loader.remove(); }, 1100);
        }, 120);
      };
      window.requestAnimationFrame(lStep);
    }
  }

  /* ---------- 2. Gordijn-overgang tussen pagina's ---------------------- */
  var curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<img src="images/logo.png" alt="" width="560" height="199">';
  document.body.appendChild(curtain);

  if (root.classList.contains('arrive')) {
    curtain.classList.add('is-cover', 'no-anim');
    root.classList.remove('arrive');
    void curtain.offsetWidth;
    curtain.classList.remove('no-anim');
    window.requestAnimationFrame(function () {
      curtain.classList.remove('is-cover');
      curtain.classList.add('is-leave');
      setTimeout(function () { curtain.classList.remove('is-leave'); }, 1000);
    });
  }

  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // anker op dezelfde pagina
      // pagina's: /, /contact.html of /contact (Netlify maakt links zonder .html)
      if (!/(\.html|\/|\/[^.\/]+)$/.test(url.pathname)) return;
      e.preventDefault();
      store.set('mdNav', '1');
      curtain.classList.remove('is-leave');
      curtain.classList.add('is-cover');
      setTimeout(function () { window.location.href = url.href; }, 620);
    });
  }
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { curtain.className = 'curtain'; try { window.sessionStorage.removeItem('mdNav'); } catch (err) { /* */ } }
  });

  /* ---------- 3. Header + mobiel menu ---------------------------------- */
  var header = $('.site-header');
  var burger = $('.burger');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (header) header.classList.remove('is-hidden');
    var main = document.getElementById('main');
    if (main) { if (open) main.setAttribute('inert', ''); else main.removeAttribute('inert'); }
    if (open) {
      var first = menu.querySelector('a');
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setMenu(false); burger.focus(); return; }
      if (e.key === 'Tab') {
        var items = [burger].concat($$('a, button', menu));
        var firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- 4. Koppen woord-voor-woord ------------------------------- */
  function wrapWords(el, make) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            frag.appendChild(make(t, i++));
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(el);
    return i;
  }
  if (!reduceMotion) {
    $$('.d[data-reveal], .phero h1.d, .cta-final .d').forEach(function (el) {
      if (el.closest('.hero') || el.classList.contains('block__num')) return;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      wrapWords(el, function (t, i) {
        var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        var wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i); wi.textContent = t;
        w.appendChild(wi);
        return w;
      });
      el.setAttribute('data-reveal', 'split');
    });
  }

  /* ---------- 5. Scroll-reveals ---------------------------------------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          (entry.target._revealTargets || [entry.target]).forEach(function (t) { t.classList.add('is-in'); });
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    var arriving = curtain.classList.contains('is-leave');
    var startDelay = root.classList.contains('loading') ? 1300 : arriving ? 380 : 0;
    setTimeout(function () { revealEls.forEach(function (el) {
      // Foto's met data-reveal="cut" zijn volledig weggeknipt; observeer het omliggende blok.
      if (el.getAttribute('data-reveal') === 'cut' && el.parentElement) {
        var box = el.parentElement;
        (box._revealTargets = box._revealTargets || []).push(el);
        io.observe(box);
      } else {
        io.observe(el);
      }
    }); }, startDelay);
    setTimeout(function () { // vangnet
      revealEls.forEach(function (el) { if (el.getBoundingClientRect().top < vh) el.classList.add('is-in'); });
    }, 4500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 6. Optellende cijfers ------------------------------------ */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1600, start = null;
    (function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) window.requestAnimationFrame(step);
    })(performance.now());
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* ---------- 7. Scroll-loop ------------------------------------------- */
  // Eén requestAnimationFrame-lus voor alle scroll-gekoppelde effecten.
  var updaters = [];
  var sy = window.scrollY, lastY = sy, vel = 0;

  // Voortgangsbalk
  var progress = document.createElement('div');
  progress.className = 'progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  updaters.push(function () {
    var max = document.documentElement.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (max > 0 ? clamp(sy / max, 0, 1) : 0) + ')';
  });

  // Header: krimpt, en verdwijnt bij naar beneden scrollen
  if (header) {
    var hidden = false;
    updaters.push(function () {
      header.classList.toggle('is-scrolled', sy > 40);
      var hide = sy > 420 && vel > 2 && !document.body.classList.contains('menu-open');
      var show = vel < -2 || sy < 200;
      if (hide && !hidden) { header.classList.add('is-hidden'); hidden = true; }
      else if (show && hidden) { header.classList.remove('is-hidden'); hidden = false; }
    });
  }

  if (!reduceMotion) {
    // Hero: foto zakt weg, tekst vliegt omhoog
    var hero = $('.hero');
    if (hero) {
      var heroImg = $('.hero__media img', hero), heroContent = $('.hero__content', hero), heroSide = $('.hero__side', hero);
      updaters.push(function () {
        if (sy > vh * 1.2) return;
        var p = clamp(sy / vh, 0, 1);
        heroImg.style.setProperty('--py', (sy * 0.32).toFixed(1) + 'px');
        heroContent.style.transform = 'translate3d(0,' + (-sy * 0.22).toFixed(1) + 'px,0)';
        heroContent.style.opacity = (1 - p * 1.3).toFixed(3);
        if (heroSide) heroSide.style.transform = 'translate3d(0,' + (sy * 0.15).toFixed(1) + 'px,0)';
      });
    }
    var pheroBg = $('.phero__bg img');
    if (pheroBg) {
      pheroBg.parentElement.classList.add('par');
      updaters.push(function () {
        if (sy > vh * 1.2) return;
        pheroBg.style.setProperty('--py', (sy * 0.3).toFixed(1) + 'px');
      });
    }

    // Parallax in foto's
    $$('.feature__media, .block__media:not(.block__media--poster), .cta-final .media, .values-wrap .media, .phero--portrait .media, .phero--type .media').forEach(function (box) {
      var img = $('img', box);
      if (!img) return;
      box.classList.add('par');
      updaters.push(function () {
        var r = box.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var off = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', (off * r.height * -0.14).toFixed(1) + 'px');
      });
    });

    // Statement vult zich woord voor woord
    $$('[data-fill]').forEach(function (el) {
      var words = [];
      wrapWords(el, function (t) {
        var s = document.createElement('span'); s.className = 'fw'; s.textContent = t; words.push(s); return s;
      });
      var lit = -1;
      updaters.push(function () {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
        var n = Math.round(p * words.length);
        if (n === lit) return;
        lit = n;
        words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
      });
    });

    // Footer-tekst schuift mee
    var fBig = $('.footer-big');
    if (fBig) {
      updaters.push(function () {
        var r = fBig.getBoundingClientRect();
        if (r.top > vh) return;
        var p = clamp(1 - r.top / vh, 0, 1);
        fBig.style.transform = 'translate3d(' + ((0.35 - p) * 30).toFixed(2) + 'vw,0,0)';
      });
    }
  }

  /* ---------- 8. Horizontale fotoreeks (home, desktop) ----------------- */
  var hs = $('.hs');
  if (hs && !reduceMotion) {
    var strip = $('.strip', hs), ghost = $('.hs__ghost', hs);
    var hsOn = false, hsDist = 0;
    var hsLayout = function () {
      var want = vw >= 1100;
      if (want !== hsOn) { hsOn = want; hs.classList.toggle('hs--on', want); }
      if (!hsOn) { strip.style.removeProperty('--hx'); hs.style.removeProperty('--hs-h'); return; }
      hsDist = Math.max(0, strip.scrollWidth - vw);
      hs.style.setProperty('--hs-h', (vh + hsDist * 1.1) + 'px');
    };
    hsLayout();
    window.addEventListener('resize', hsLayout, { passive: true });
    window.addEventListener('load', hsLayout);
    updaters.push(function () {
      if (!hsOn) return;
      var r = hs.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var total = hs.offsetHeight - vh;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      strip.style.setProperty('--hx', (-p * hsDist).toFixed(1) + 'px');
      if (ghost) ghost.style.setProperty('--gx', (vw * 0.1 - p * vw * 0.9).toFixed(1) + 'px');
    });
  }

  /* ---------- 9. Ticker op scrollsnelheid ------------------------------ */
  var tickers = $$('.ticker__track');
  tickers.forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (child) { // dupliceren voor naadloze loop
      var c = child.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    });
  });
  if (!reduceMotion && tickers.length) {
    var tState = tickers.map(function (t) { t.parentElement.classList.add('js-ticker'); return { el: t, x: 0, dir: 1, skew: 0 }; });
    updaters.push(function () {
      tState.forEach(function (t) {
        var half = t.el.scrollWidth / 2;
        if (vel > 0.5) t.dir = 1; else if (vel < -0.5) t.dir = -1;
        t.x -= (0.9 + Math.min(Math.abs(vel) * 0.35, 18)) * t.dir;
        if (t.x <= -half) t.x += half;
        if (t.x > 0) t.x -= half;
        t.skew += (clamp(-vel * 0.25, -12, 12) - t.skew) * 0.12;
        t.el.style.transform = 'translate3d(' + t.x.toFixed(2) + 'px,0,0) skewX(' + t.skew.toFixed(2) + 'deg)';
      });
    });
  }

  /* ---------- 10. Magnetische knoppen + menu-effect (alleen muis) ----- */
  if (finePointer && !reduceMotion) {
    $$('.btn, .burger, .reel__btn, .lb-btn').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = clamp((e.clientX - (r.left + r.width / 2)) * 0.28, -14, 14);
        var dy = clamp((e.clientY - (r.top + r.height / 2)) * 0.35, -10, 10);
        el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });

    // Menu-links: letters husselen even bij hover
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $$('.nav a').forEach(function (a) {
      var node = a.firstChild;
      if (!node || node.nodeType !== 3) return;
      var orig = node.textContent, timer = null;
      a.addEventListener('mouseenter', function () {
        var f = 0, frames = 12;
        clearInterval(timer);
        timer = setInterval(function () {
          f++;
          node.textContent = orig.split('').map(function (ch, i) {
            if (ch === ' ' || i < (f / frames) * orig.length) return ch;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          }).join('');
          if (f >= frames) { clearInterval(timer); node.textContent = orig; }
        }, 32);
      });
    });
  }

  /* ---------- 11. Klik-rimpel ------------------------------------------ */
  if (!reduceMotion) {
    document.addEventListener('pointerdown', function (e) {
      var el = e.target.closest('.btn, .pick, .chip');
      if (!el) return;
      var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.4;
      var rp = document.createElement('span');
      rp.className = 'ripple';
      rp.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(rp);
      setTimeout(function () { rp.remove(); }, 800);
    });
  }

  /* ---------- 13. Prijskaarten kantelen -------------------------------- */
  if (finePointer && !reduceMotion) {
    $$('.price').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
    });
  }

  /* ---------- 14. Galerij: reels-feed ---------------------------------- */
  var reel = $('.reel');
  if (reel) {
    var reelItems = $$('.reel__item', reel);
    var hudCount = $('.reel__count b', reel), hudBar = $('.reel__bar', reel);
    var active = -1;
    var likes = {};
    try { likes = JSON.parse(window.localStorage.getItem('mdLikes') || '{}') || {}; } catch (e) { likes = {}; }
    var saveLikes = function () { try { window.localStorage.setItem('mdLikes', JSON.stringify(likes)); } catch (e) { /* */ } };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        root.classList.toggle('reel-in', en[0].isIntersecting);
      }, { rootMargin: '-40% 0px -40% 0px' }).observe(reel);
    }

    var setActive = function (i) {
      if (i === active) return;
      active = i;
      reelItems.forEach(function (it, j) { it.classList.toggle('is-active', j === i); });
      hudCount.textContent = String(i + 1).padStart(2, '0');
    };
    if (reduceMotion) reelItems.forEach(function (it) { it.classList.add('is-active'); });

    updaters.push(function () {
      var best = 0, bestD = Infinity;
      reelItems.forEach(function (it, i) {
        var r = it.getBoundingClientRect();
        var p = r.top / vh; // -1 = net weg, 0 = vol in beeld, 1 = komt eraan
        if (Math.abs(p) < bestD) { bestD = Math.abs(p); best = i; }
        if (reduceMotion || p < -1.05 || p > 1.05) return;
        var stage = it.firstElementChild;
        if (p < 0) { // vertrekt: blijft hangen, krimpt en dimt
          stage.style.transform = 'translate3d(0,' + (-p * vh * 0.82).toFixed(1) + 'px,0) scale(' + (1 + p * 0.14).toFixed(4) + ')';
          stage.style.setProperty('--dim', (-p * 0.75).toFixed(3));
          stage.style.setProperty('--zs', '1');
        } else { // komt binnen: foto zoomt van 1.15 naar 1
          stage.style.transform = '';
          stage.style.setProperty('--dim', '0');
          stage.style.setProperty('--zs', (1 + p * 0.15).toFixed(4));
        }
      });
      if (bestD < 0.5) setActive(best);
      var first = reelItems[0].getBoundingClientRect().top, total = reel.offsetHeight - vh;
      hudBar.style.setProperty('--rp', clamp(-first / total, 0, 1).toFixed(3));
    });

    var toast = function (msg) {
      var t = document.createElement('div');
      t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 2300);
    };

    reelItems.forEach(function (it, i) {
      var stage = $('.reel__stage', it), like = $('.reel__like', it), burst = $('.reel__burst', it), share = $('.reel__share', it);
      var setLike = function (on) {
        like.setAttribute('aria-pressed', String(on));
        if (on) likes[i] = 1; else delete likes[i];
        saveLikes();
      };
      if (likes[i]) like.setAttribute('aria-pressed', 'true');
      like.addEventListener('click', function () { setLike(like.getAttribute('aria-pressed') !== 'true'); });
      share.addEventListener('click', function () {
        var url = window.location.href.split('#')[0];
        if (navigator.share) {
          navigator.share({ title: 'MD Performance', text: $('.reel__title', it).textContent, url: url }).catch(function () { /* geannuleerd */ });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () { toast('Link gekopieerd'); });
        }
      });
      // Dubbeltik / dubbelklik = like met hartje
      var lastTap = 0, lx = 0, ly = 0;
      stage.addEventListener('pointerup', function (e) {
        if (e.target.closest('.reel__act')) return;
        var now = Date.now();
        if (now - lastTap < 320 && Math.abs(e.clientX - lx) < 30 && Math.abs(e.clientY - ly) < 30) {
          lastTap = 0;
          var r = stage.getBoundingClientRect();
          burst.style.left = (e.clientX - r.left) + 'px';
          burst.style.top = (e.clientY - r.top) + 'px';
          burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
          setLike(true);
        } else { lastTap = now; lx = e.clientX; ly = e.clientY; }
      });
      stage.addEventListener('dblclick', function (e) { e.preventDefault(); });
    });

    // TikTok-snap: na het scrollen schuift de feed door naar de volgende of
    // vorige foto, afhankelijk van de richting. (CSS scroll-snap liet een
    // muiswiel hangen op de eerste foto.)
    var goTo = function (i) {
      var top = reel.getBoundingClientRect().top + window.scrollY + i * vh;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var snapDir = 1, snapPrevY = window.scrollY, snapTimer = null, touching = false;
    var softSnap = function () {
      if (touching || reduceMotion) return;
      var f = (window.scrollY - (reel.getBoundingClientRect().top + window.scrollY)) / vh;
      if (f < -0.6 || f > reelItems.length - 1 + 0.6) return;
      var target = snapDir > 0 ? Math.ceil(f - 0.04) : Math.floor(f + 0.04);
      if (target < 0 || target > reelItems.length - 1) return;
      if (Math.abs(f - target) * vh > 2) goTo(target);
    };
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y !== snapPrevY) snapDir = y > snapPrevY ? 1 : -1;
      snapPrevY = y;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(softSnap, 170);
    }, { passive: true });
    window.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    window.addEventListener('touchend', function () {
      touching = false; clearTimeout(snapTimer); snapTimer = setTimeout(softSnap, 170);
    }, { passive: true });

    // Pijltjestoetsen springen naar de volgende/vorige foto
    document.addEventListener('keydown', function (e) {
      if (!root.classList.contains('reel-in') || e.target.closest('input, textarea')) return;
      var dir = (e.key === 'ArrowDown' || e.key === 'j') ? 1 : (e.key === 'ArrowUp' || e.key === 'k') ? -1 : 0;
      if (!dir || !reelItems[active + dir]) return;
      e.preventDefault();
      goTo(active + dir);
    });
  }

  /* ---------- 15. Galerij-lightbox (voor een eventuele foto-grid) ------ */
  var items = $$('.gallery__item');
  if (items.length && typeof HTMLDialogElement === 'function') {
    var icon = function (d) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true"><path d="' + d + '"/></svg>';
    };
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Foto vergroot');
    dlg.innerHTML =
      '<div class="lb-top"><p class="lb-count" aria-live="polite"><b>01</b> / ' + String(items.length).padStart(2, '0') + '</p>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Sluiten (Esc)">' + icon('M5 5l14 14M19 5L5 19') + '</button></div>' +
      '<div class="lb-stage"><button class="lb-btn lb-nav lb-prev" type="button" aria-label="Vorige foto">' + icon('M15 4l-8 8 8 8') + '</button>' +
      '<img alt=""><button class="lb-btn lb-nav lb-next" type="button" aria-label="Volgende foto">' + icon('M9 4l8 8-8 8') + '</button></div><p class="lb-cap"></p>';
    document.body.appendChild(dlg);
    var lbImg = $('img', dlg), lbCount = $('.lb-count b', dlg), lbCap = $('.lb-cap', dlg);
    var current = 0, lastTrigger = null;
    var show = function (i) {
      current = (i + items.length) % items.length;
      var it = items[current], thumb = $('img', it);
      lbImg.style.opacity = '0';
      lbImg.onload = function () { lbImg.style.opacity = '1'; lbImg.style.transform = ''; };
      lbImg.src = it.getAttribute('data-full') || thumb.currentSrc || thumb.src;
      lbImg.alt = thumb.alt;
      lbCount.textContent = String(current + 1).padStart(2, '0');
      lbCap.textContent = it.getAttribute('data-caption') || '';
    };
    items.forEach(function (it, i) {
      it.addEventListener('click', function () { lastTrigger = it; show(i); dlg.showModal(); document.body.style.overflow = 'hidden'; });
    });
    dlg.addEventListener('close', function () { document.body.style.overflow = ''; if (lastTrigger) lastTrigger.focus(); });
    $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    $('.lb-prev', dlg).addEventListener('click', function () { show(current - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { show(current + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
  }

  /* ---------- 16. Contact: WhatsApp-composer --------------------------- */
  var wa = $('.wa');
  if (wa) {
    var phone = wa.getAttribute('data-phone');
    var picks = $$('.pick', wa), send = $('.wa__send', wa), bubble = $('.wa__bubble', wa), waText = $('.wa__text', wa);
    var selected = null, typingTimer = null;
    var val = function (n) { var el = $('[name="' + n + '"]', wa); return el ? el.value.trim() : ''; };
    var buildMsg = function () {
      var intro = selected ? selected.getAttribute('data-msg') : 'Ik wil graag een proefles plannen bij MD Performance.';
      return 'Hoi Mert! ' + intro + '\n\nNaam speler: ' + val('naam') + '\nLeeftijd: ' + val('leeftijd') + '\nClub en team: ' + val('club');
    };
    var render = function (animate) {
      var m = buildMsg();
      send.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(m);
      if (!animate || reduceMotion) { if (!typingTimer) waText.textContent = m; return; }
      bubble.classList.add('is-typing');
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        typingTimer = null;
        waText.textContent = buildMsg();
        bubble.classList.remove('is-typing', 'pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      }, 700);
    };
    var select = function (p, animate) {
      selected = p;
      picks.forEach(function (x) { var on = x === p; x.classList.toggle('is-selected', on); x.setAttribute('aria-pressed', String(on)); });
      render(animate);
      if (animate) { send.classList.remove('nudge'); void send.offsetWidth; send.classList.add('nudge'); }
    };
    picks.forEach(function (p) {
      p.setAttribute('role', 'button');
      p.setAttribute('aria-pressed', 'false');
      p.removeAttribute('target');
      p.addEventListener('click', function (e) { e.preventDefault(); select(p, true); });
    });
    $$('input', wa).forEach(function (inp) { inp.addEventListener('input', function () { render(false); }); });
    var type = new URLSearchParams(window.location.search).get('type');
    var pre = type && $('.pick[data-type="' + type + '"]', wa);
    if (pre) select(pre, false); else render(false);
  }

  /* ---------- 17. Kleine extra's + start van de lus -------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  (function loop() {
    sy = window.scrollY;
    vel += ((sy - lastY) - vel) * 0.25;
    lastY = sy;
    for (var i = 0; i < updaters.length; i++) updaters[i]();
    window.requestAnimationFrame(loop);
  })();
})();
