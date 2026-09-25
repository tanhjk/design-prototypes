/* ==========================================================================
   SCHOLAR'S CHOICE — main.js
   --------------------------------------------------------------------------
   Vanilla, no dependencies, no build step. Each behaviour is an isolated
   init function that exits quietly if its markup is not on the page, so the
   same file serves every template.

   01. mobileNav()        — header drawer toggle
   02. stickyHeader()     — shadow on scroll
   03. anchorBanner()     — provider ad carousel
   04. revealOnScroll()   — .sc-reveal → .is-visible
   05. readingProgress()  — article scroll bar
   06. placeholderLinks() — stops "#" links from jumping the page
   07. videoModal()       — full-screen video carousel
   08. scholarshipCarousel() — paged rail of featured scholarships
   09. providerRail()     — shuffles the featured providers
   10. articleTabs()      — the story / the work / #AMA panels
   11. contactForm()      — contact-us.html validation (sends nothing yet)
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     01 · MOBILE NAV
     ------------------------------------------------------------------------ */
  function mobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-nav-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close when a link inside the drawer is followed
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Escape closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state when the viewport grows past the drawer breakpoint
    window.matchMedia('(min-width: 1025px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     02 · STICKY HEADER SHADOW
     ------------------------------------------------------------------------ */
  function stickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
     03 · ANCHOR BANNER CAROUSEL
     Auto-advances every 6s. Pauses on hover, on focus within, and when the
     tab is hidden. Arrow keys work when a control has focus, and on touch
     the viewport can be swiped left/right. Slide order is reshuffled on every
     page load.
     ------------------------------------------------------------------------ */
  function anchorBanner() {
    var root = document.getElementById('anchor-banner');
    if (!root) return;

    var viewport = root.querySelector('.anchor-banner__viewport');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.anchor-banner__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.anchor-banner__dot'));
    if (slides.length < 2) return;

    /* Every page load gets a fresh running order, so no advertiser is
       permanently stuck in the first position. */
    function shuffleSlides() {
      if (!viewport) return;
      for (var i = slides.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = slides[i]; slides[i] = slides[j]; slides[j] = tmp;
      }
      var frag = document.createDocumentFragment();
      slides.forEach(function (slide, i) {
        slide.classList.remove('is-active');
        slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
        // Whichever creative drew first place is the one worth loading eagerly
        var img = slide.querySelector('img');
        if (img) {
          img.loading = i === 0 ? 'eager' : 'lazy';
          if (i === 0) img.fetchPriority = 'high';
        }
        frag.appendChild(slide);
      });
      viewport.appendChild(frag);
    }
    shuffleSlides();

    var index = 0;
    var timer = null;
    var INTERVAL = 6000;

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', String(i === index));
      });
    }

    function start() {
      if (prefersReducedMotion) return;
      stop();
      timer = window.setInterval(function () { go(index + 1); }, INTERVAL);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    var prev = root.querySelector('[data-banner-prev]');
    var next = root.querySelector('[data-banner-next]');
    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); start(); });
    });

    /* Touch swipe. The slides are links, so a drag has to be told apart from
       a tap: past the threshold we swallow the click that follows the swipe. */
    if (viewport) {
      var SWIPE_MIN = 40;      // px of travel before it counts as a swipe
      var startX = 0, startY = 0, dragging = false, swiped = false;

      viewport.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragging = true;
        swiped = false;
        stop();
      }, { passive: true });

      viewport.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].clientY - startY;
        // Vertical intent wins: let the page scroll and drop the gesture
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; }
      }, { passive: true });

      viewport.addEventListener('touchend', function (e) {
        if (!dragging) { start(); return; }
        dragging = false;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) >= SWIPE_MIN) {
          swiped = true;
          go(dx < 0 ? index + 1 : index - 1);
        }
        start();
      });

      viewport.addEventListener('touchcancel', function () {
        dragging = false;
        start();
      });

      viewport.addEventListener('click', function (e) {
        if (swiped) { e.preventDefault(); swiped = false; }
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); start(); }
      if (e.key === 'ArrowRight') { go(index + 1); start(); }
    });

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    go(0);
    start();
  }

  /* ------------------------------------------------------------------------
     04 · REVEAL ON SCROLL
     ------------------------------------------------------------------------ */
  function revealOnScroll() {
    var items = document.querySelectorAll('.sc-reveal');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     05 · READING PROGRESS  (article template only)
     ------------------------------------------------------------------------ */
  function readingProgress() {
    var bar = document.getElementById('reading-progress');
    var body = document.getElementById('article-body');
    if (!bar || !body) return;

    var fill = bar.querySelector('span');
    var ticking = false;

    function update() {
      var start = body.offsetTop - window.innerHeight * 0.5;
      var end = body.offsetTop + body.offsetHeight - window.innerHeight * 0.5;
      var pct = (window.scrollY - start) / Math.max(end - start, 1);
      fill.style.width = Math.min(Math.max(pct, 0), 1) * 100 + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------------
     06 · PLACEHOLDER LINKS
     Every nav/CTA target that is not built yet points at "#". Without this,
     clicking one scrolls the page to the top, which reads as a bug during
     stakeholder reviews. Remove this function once real routes exist.
     ------------------------------------------------------------------------ */
  function placeholderLinks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link.getAttribute('href') === '#') e.preventDefault();
    });
  }

  /* ------------------------------------------------------------------------
     07 · VIDEO MODAL
     Clicking a reel opens a full-screen player that autoplays, and doubles as
     a carousel: arrows, keyboard, swipe and a thumbnail strip move between
     reels without closing. Each reel carries its file in data-video-src —
     swap those for your real assets (or point them at an embed and replace
     showReel() below).
     ------------------------------------------------------------------------ */
  function videoModal() {
    var reels = Array.prototype.slice.call(
      document.querySelectorAll('[data-video-id]')
    );
    if (!reels.length) return;

    /* Read everything the modal needs off the cards already on the page. */
    var items = reels.map(function (reel) {
      function text(sel) {
        var el = reel.querySelector(sel);
        return el ? el.textContent.trim() : '';
      }
      var poster = reel.querySelector('img');
      var stats = reel.querySelector('.video-reel__stats');
      return {
        id: reel.getAttribute('data-video-id'),
        src: reel.getAttribute('data-video-src') || '',
        poster: poster ? poster.getAttribute('src') : '',
        eyebrow: text('.video-reel__eyebrow'),
        title: text('.video-reel__title'),
        stats: stats ? stats.innerHTML : ''
      };
    });

    var ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5zM17 9l4 6m0-6-4 6"/></svg>';
    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m6 7-7-7 7-7"/></svg>';
    var ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>';

    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video player');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="video-modal__bar">' +
        '<div class="video-modal__bar-left">' +
          '<p class="video-modal__count" data-modal-count></p>' +
          '<button type="button" class="video-modal__unmute" hidden>' + ICON_MUTED + '<span>Tap for sound</span></button>' +
        '</div>' +
        '<button type="button" class="video-modal__close" aria-label="Close video">' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="video-modal__stage">' +
        '<button type="button" class="video-modal__nav video-modal__nav--prev" aria-label="Previous video">' + ICON_PREV + '</button>' +
        '<div class="video-modal__player">' +
          '<video class="video-modal__video" playsinline controls preload="metadata"></video>' +
          '<div class="video-modal__caption">' +
            '<p class="video-modal__eyebrow" data-modal-eyebrow></p>' +
            '<h2 class="video-modal__title" data-modal-title></h2>' +
            '<p class="video-modal__stats" data-modal-stats></p>' +
          '</div>' +
          '<div class="video-modal__dots" data-modal-dots></div>' +
        '</div>' +
        '<button type="button" class="video-modal__nav video-modal__nav--next" aria-label="Next video">' + ICON_NEXT + '</button>' +
      '</div>';
    document.body.appendChild(modal);

    var video = modal.querySelector('.video-modal__video');
    var elCount = modal.querySelector('[data-modal-count]');
    var elEyebrow = modal.querySelector('[data-modal-eyebrow]');
    var elTitle = modal.querySelector('[data-modal-title]');
    var elStats = modal.querySelector('[data-modal-stats]');
    var elDots = modal.querySelector('[data-modal-dots]');
    var btnClose = modal.querySelector('.video-modal__close');
    var btnUnmute = modal.querySelector('.video-modal__unmute');
    var btnPrev = modal.querySelector('.video-modal__nav--prev');
    var btnNext = modal.querySelector('.video-modal__nav--next');

    var current = -1;
    var isOpen = false;
    var lastFocused = null;

    /* Thumbnail strip — one button per reel, jumps straight to it. */
    items.forEach(function (item, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'video-modal__dot';
      dot.setAttribute('aria-label', 'Play: ' + item.title);
      if (item.poster) dot.style.backgroundImage = 'url("' + item.poster + '")';
      dot.addEventListener('click', function () { showReel(i); });
      elDots.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(elDots.children);

    function showReel(index) {
      current = (index + items.length) % items.length;
      var item = items[current];

      video.pause();
      video.poster = item.poster;
      video.src = item.src;
      video.load();

      elCount.textContent = (current + 1) + ' / ' + items.length;
      elEyebrow.textContent = item.eyebrow;
      elTitle.textContent = item.title;
      elStats.innerHTML = item.stats;
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-current', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });

      /* Autoplay with sound where the browser allows it; fall back to muted,
         which every browser permits, rather than leaving a frozen poster. The
         pill in the bar then offers the sound back in one tap. */
      video.muted = false;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (!isOpen) return;
          video.muted = true;
          var retry = video.play();
          if (retry && typeof retry.catch === 'function') {
            retry.catch(function () { /* user can press play */ });
          }
        });
      }
    }

    function open(index) {
      lastFocused = document.activeElement;
      isOpen = true;
      modal.hidden = false;
      /* Next frame, so the opacity transition has a starting value. */
      requestAnimationFrame(function () {
        if (isOpen) modal.classList.add('is-open');
      });
      document.body.classList.add('is-modal-open');
      showReel(index);
      btnClose.focus();
    }

    function close() {
      isOpen = false;
      modal.classList.remove('is-open');
      document.body.classList.remove('is-modal-open');
      video.pause();
      video.removeAttribute('src');
      video.load();
      window.setTimeout(function () { modal.hidden = true; }, prefersReducedMotion ? 0 : 260);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    reels.forEach(function (reel, i) {
      reel.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });

    btnClose.addEventListener('click', close);
    btnUnmute.addEventListener('click', function () {
      video.muted = false;
      video.play();
    });
    video.addEventListener('volumechange', function () {
      btnUnmute.hidden = !video.muted;
    });
    btnPrev.addEventListener('click', function () { showReel(current - 1); });
    btnNext.addEventListener('click', function () { showReel(current + 1); });

    /* Click the backdrop (but not the player) to dismiss. */
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('video-modal__stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowRight') { showReel(current + 1); return; }
      if (e.key === 'ArrowLeft') { showReel(current - 1); return; }
      if (e.key !== 'Tab') return;
      /* Keep focus inside the dialog while it is open. */
      var focusable = modal.querySelectorAll('button, video, [href]');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* Swipe between reels on touch. */
    var touchStartX = null;
    modal.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    modal.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) < 50) return;
      showReel(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    /* Roll into the next reel when one finishes, like a feed. */
    video.addEventListener('ended', function () { showReel(current + 1); });
  }

  /* No card deserves the first slot every visit, so deal the rail afresh on
     each load — Fisher-Yates over the real nodes, written back in one
     fragment so the browser lays the rail out once. */
  function shuffleRail(rail) {
    var order = Array.prototype.slice.call(rail.children);
    if (order.length < 2) return;
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
    var frag = document.createDocumentFragment();
    for (var k = 0; k < order.length; k++) frag.appendChild(order[k]);
    rail.appendChild(frag);
  }

  /* ------------------------------------------------------------------------
     08 · SCHOLARSHIP CAROUSEL
     A native scroll-snap rail: the CSS sizes cards so one viewport holds a
     full page (three on desktop, two then one as it narrows), and this only
     drives the arrows and dots off the real scroll position.
     ------------------------------------------------------------------------ */
  function scholarshipCarousel() {
    var rail = document.getElementById('scholarship-rail');
    if (!rail) return;

    var carousel = rail.closest('.scholarship-carousel');
    if (!carousel) return;
    var btnPrev = carousel.querySelector('[data-carousel-prev]');
    var btnNext = carousel.querySelector('[data-carousel-next]');
    var elDots = carousel.querySelector('[data-carousel-dots]');

    shuffleRail(rail);

    var cards = Array.prototype.slice.call(rail.children);
    if (!cards.length) return;

    var perPage = 1;
    var pages = 1;
    var pitch = 0;
    var dots = [];

    /* One card's pitch — width plus gap — read off the live layout rather
       than assumed, so the breakpoints stay the CSS's business. */
    function step() {
      if (cards.length < 2) return rail.clientWidth;
      return cards[1].getBoundingClientRect().left -
             cards[0].getBoundingClientRect().left;
    }

    function measure() {
      pitch = step();
      perPage = pitch > 0 ? Math.max(1, Math.round(rail.clientWidth / pitch)) : 1;
      pages = Math.max(1, Math.ceil(cards.length / perPage));
    }

    function currentPage() {
      if (!pitch) return 0;
      return Math.min(pages - 1, Math.round(rail.scrollLeft / (pitch * perPage)));
    }

    function buildDots() {
      elDots.innerHTML = '';
      dots = [];
      if (pages < 2) return;
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'scholarship-carousel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Scholarships ' + (i + 1) + ' of ' + pages);
        dot.addEventListener('click', goTo.bind(null, i));
        elDots.appendChild(dot);
        dots.push(dot);
      }
    }

    function goTo(page) {
      var card = cards[Math.min(cards.length - 1, page * perPage)];
      var left = rail.scrollLeft +
        (card.getBoundingClientRect().left - rail.getBoundingClientRect().left);
      if (rail.scrollTo) {
        rail.scrollTo({ left: left, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      } else {
        rail.scrollLeft = left;
      }
      sync();
    }

    function sync() {
      var page = currentPage();
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === page);
        dot.setAttribute('aria-selected', i === page ? 'true' : 'false');
      });
      /* Compare against the real scroll extent: sub-pixel widths mean the
         last page rarely lands on an exact multiple. */
      btnPrev.disabled = rail.scrollLeft <= 1;
      btnNext.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
    }

    btnPrev.addEventListener('click', function () { goTo(currentPage() - 1); });
    btnNext.addEventListener('click', function () { goTo(currentPage() + 1); });

    /* sync() only reads cached numbers plus scrollLeft, so it is cheap enough
       to run straight off the scroll event — no rAF gate to get stuck on. */
    rail.addEventListener('scroll', sync, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        measure();
        buildDots();
        sync();
      }, 150);
    });

    /* Browsers restore an element's scrollLeft on reload and on a back/forward
       restore, which would land the freshly shuffled rail mid-deck. Put it
       back to card one — instantly, so no one sees it slide. */
    function resetToStart() {
      rail.scrollLeft = 0;
      sync();
    }

    measure();
    buildDots();
    resetToStart();

    /* Scroll restoration runs after this script, so claim the start position
       again once the page has settled and whenever it comes out of bfcache. */
    window.addEventListener('load', resetToStart);
    window.addEventListener('pageshow', resetToStart);
  }

  /* ------------------------------------------------------------------------
     09 · PROVIDER RAIL
     A plain scroll rail, no paging — it only needs the same fresh deal as the
     scholarship carousel so no provider owns the leftmost slot.
     ------------------------------------------------------------------------ */
  function providerRail() {
    var rail = document.getElementById('provider-rail');
    if (!rail) return;
    shuffleRail(rail);
    rail.scrollLeft = 0;
  }

  /* ------------------------------------------------------------------------
     10 · ARTICLE TABS  (article template only)
     Progressive enhancement: the tablist is hidden until this runs, so with
     JS off all three parts stay on the page as one continuous article.

     Below 1024px the scholarship sidebar stops being a column and becomes a
     4th tab. It stays where it is in the DOM — with every article panel
     hidden, the main column is just the tablist and the sidebar reads as the
     panel directly beneath it.
     ------------------------------------------------------------------------ */
  function articleTabs() {
    var list = document.querySelector('.article-tabs');
    var main = document.querySelector('.article-body__main');
    if (!list || !main) return;

    var allTabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var aside = document.getElementById('scholarship-sidebar');
    var mq = window.matchMedia('(max-width: 1024px)');
    var tabs = [];
    var active = 0;

    if (!allTabs.length) return;

    function panelFor(tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    }
    /* A tab whose panel is missing is dropped rather than left to throw. */
    allTabs = allTabs.filter(panelFor);
    if (!allTabs.length) return;

    /* The set of live tabs depends on width: the mobile-only tab is out of
       the rotation, and its panel is shown unconditionally, on desktop. */
    function build() {
      tabs = allTabs.filter(function (tab) {
        return !tab.hasAttribute('data-mobile-only') || mq.matches;
      });
      if (active >= tabs.length) active = 0;
    }

    function sync(focus) {
      allTabs.forEach(function (tab) {
        var i = tabs.indexOf(tab);
        var on = i !== -1 && i === active;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        panelFor(tab).hidden = i !== -1 && !on;
      });
      if (focus) tabs[active].focus();
    }

    /* The sidebar is only a tabpanel while it is in the tab set. On desktop
       it goes back to being a plain complementary aside. */
    function asideAsPanel(on) {
      if (!aside) return;
      aside.classList.toggle('is-tab-panel', on);
      if (on) {
        aside.setAttribute('role', 'tabpanel');
        aside.setAttribute('aria-labelledby', 'tab-scholarship');
        aside.tabIndex = 0;
      } else {
        aside.removeAttribute('role');
        aside.removeAttribute('aria-labelledby');
        aside.removeAttribute('tabindex');
      }
    }

    function select(i, focus) {
      active = i;
      sync(focus);
    }

    allTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var i = tabs.indexOf(tab);
        if (i === -1) return;
        select(i, false);
        /* Keep the panel in view: switching from a long panel to a short one
           can otherwise leave the reader scrolled past the whole column. */
        var top = list.getBoundingClientRect().top + window.scrollY - 100;
        if (window.scrollY > top) {
          window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    });

    /* A link to #the-work should open that tab rather than land on a hidden
       panel — both on load and when the hash changes later. */
    function fromHash() {
      var id = window.location.hash.slice(1);
      if (!id) return;
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('aria-controls') === id) { select(i, false); return; }
      }
    }

    function onBreakpoint() {
      build();
      asideAsPanel(mq.matches);
      sync(false);
    }

    main.classList.add('is-tabbed');
    if (main.parentNode) main.parentNode.classList.add('is-tabbed');
    onBreakpoint();
    fromHash();
    mq.addEventListener('change', onBreakpoint);
    window.addEventListener('hashchange', fromHash);
  }

  /* ------------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------------ */
  function init() {
    mobileNav();
    stickyHeader();
    anchorBanner();
    revealOnScroll();
    readingProgress();
    placeholderLinks();
    videoModal();
    scholarshipCarousel();
    providerRail();
    articleTabs();
    contactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
