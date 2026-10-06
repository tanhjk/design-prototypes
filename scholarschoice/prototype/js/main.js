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
   09b. storyList()       — shuffles the homepage stories, lead included
   09c. featureCarousel() — Scholars' Experience listing hero carousel
   10. articleTabs()      — the story / the work / #AMA panels
   11. contactForm()      — contact-us.html validation (sends nothing yet)
   12. authModal()        — Login / Register dialog (Google + Facebook)
   12b. searchOverlay()   — full-screen site search from the header button
   13. shareLinks()       — fills [data-share] hrefs; wires copy-link buttons
   14. scholarshipListing() — scholarships.html grid, filters, lazy load
   15. searchResults()    — search-results.html list, from ?q=
   16. scholarshipCompare() — comparison.html pickers + comparison table
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
     showReel() below). The modal's CTA links to data-article-href, falling
     back to the scholar-experience article page.
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
      return {
        id: reel.getAttribute('data-video-id'),
        src: reel.getAttribute('data-video-src') || '',
        poster: poster ? poster.getAttribute('src') : '',
        eyebrow: text('.video-reel__eyebrow'),
        title: text('.video-reel__title'),
        href: reel.getAttribute('data-article-href') || 'scholars-experience.html'
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
          '<img class="video-modal__video" alt="" hidden>' +
          '<div class="video-modal__caption">' +
            '<p class="video-modal__eyebrow" data-modal-eyebrow></p>' +
            '<h2 class="video-modal__title" data-modal-title></h2>' +
            '<a class="sc-btn sc-btn--primary sc-btn--sm video-modal__cta" data-modal-cta href="#">Read the full story</a>' +
          '</div>' +
          '<div class="video-modal__dots" data-modal-dots></div>' +
        '</div>' +
        '<button type="button" class="video-modal__nav video-modal__nav--next" aria-label="Next video">' + ICON_NEXT + '</button>' +
      '</div>';
    document.body.appendChild(modal);

    var video = modal.querySelector('video.video-modal__video');
    var still = modal.querySelector('img.video-modal__video');
    var elCount = modal.querySelector('[data-modal-count]');
    var elEyebrow = modal.querySelector('[data-modal-eyebrow]');
    var elTitle = modal.querySelector('[data-modal-title]');
    var elCta = modal.querySelector('[data-modal-cta]');
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

    /* A single-video feature (e.g. the article page's one embed) has nothing
       to count, jump between or read on from — hide that chrome rather than
       show a meaningless "1 / 1" and a one-thumbnail strip. */
    var isSolo = items.length <= 1;
    elCount.hidden = isSolo;
    elDots.hidden = isSolo;
    elCta.hidden = isSolo;
    btnPrev.hidden = isSolo;
    btnNext.hidden = isSolo;

    function showReel(index) {
      current = (index + items.length) % items.length;
      var item = items[current];

      video.pause();
      /* A reel with no data-video-src is a still: show its image full-size
         in place of the player. */
      var isStill = !item.src;
      video.hidden = isStill;
      still.hidden = !isStill;
      if (isStill) {
        video.removeAttribute('src');
        video.load();
        still.src = item.poster;
        btnUnmute.hidden = true;
      } else {
        video.poster = item.poster;
        video.src = item.src;
        video.load();
      }

      elCount.textContent = (current + 1) + ' / ' + items.length;
      elEyebrow.textContent = item.eyebrow;
      elTitle.textContent = item.title;
      elCta.href = item.href;
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-current', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      /* On mobile the strip scrolls sideways — keep the current reel centred
         in it. A no-op on desktop, where every thumbnail already fits. */
      var currentDot = dots[current];
      elDots.scrollTo({
        left: currentDot.offsetLeft - (elDots.clientWidth - currentDot.offsetWidth) / 2,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      /* Autoplay with sound where the browser allows it; fall back to muted,
         which every browser permits, rather than leaving a frozen poster. The
         pill in the bar then offers the sound back in one tap. */
      if (isStill) return;
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
      /* The thumbnail strip scrolls on its own; don't treat that as a swipe. */
      if (elDots.contains(e.target)) { touchStartX = null; return; }
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
     09b · STORY LIST  (homepage)
     All five stories are dealt afresh, the lead slot included. The lead and
     the cards have different markup, so rather than moving nodes this reads
     each story into a plain record, shuffles the records, and writes them
     back into the existing slots. Each story carries the fields the other
     layout needs as data-* attributes.
     ------------------------------------------------------------------------ */
  function storyList() {
    var lead = document.querySelector('#stories .story-lead');
    var cards = document.querySelectorAll('#stories .story-list .story-card');
    if (!lead || !cards.length) return;

    function readImg(img) {
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        width: img.getAttribute('width'),
        height: img.getAttribute('height'),
        style: img.getAttribute('style')
      };
    }
    function writeImg(img, d) {
      ['src', 'alt', 'width', 'height', 'style'].forEach(function (k) {
        if (d[k]) img.setAttribute(k, d[k]);
        else img.removeAttribute(k);
      });
    }

    var byline = lead.querySelector('.story-lead__byline');
    var stories = [{
      href: lead.getAttribute('href'),
      img: readImg(lead.querySelector('img')),
      title: lead.querySelector('.story-lead__title').innerHTML,
      standfirst: lead.querySelector('.story-lead__standfirst').innerHTML,
      tags: Array.prototype.map.call(lead.querySelectorAll('.story-lead__tags li'),
        function (li) { return li.textContent; }),
      byline: byline ? byline.innerHTML : '',
      scholar: lead.getAttribute('data-scholar'),
      meta: lead.getAttribute('data-meta')
    }];
    Array.prototype.forEach.call(cards, function (card) {
      stories.push({
        href: card.getAttribute('href'),
        img: readImg(card.querySelector('img')),
        title: card.querySelector('.story-card__title').innerHTML,
        standfirst: card.getAttribute('data-standfirst') || '',
        tags: (card.getAttribute('data-tags') || '').split('|').filter(Boolean),
        byline: card.getAttribute('data-byline') || '',
        scholar: card.querySelector('.story-card__scholar').textContent,
        meta: card.querySelector('.story-card__meta').textContent
      });
    });

    for (var i = stories.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = stories[i];
      stories[i] = stories[j];
      stories[j] = tmp;
    }

    /* Lead: first tag is the provider, drawn in lime like the original. */
    var top = stories[0];
    lead.setAttribute('href', top.href);
    lead.setAttribute('data-scholar', top.scholar);
    lead.setAttribute('data-meta', top.meta);
    writeImg(lead.querySelector('img'), top.img);
    lead.querySelector('.story-lead__title').innerHTML = top.title;
    var standfirst = lead.querySelector('.story-lead__standfirst');
    standfirst.innerHTML = top.standfirst;
    standfirst.style.display = top.standfirst ? '' : 'none';
    var tagList = lead.querySelector('.story-lead__tags');
    tagList.innerHTML = '';
    top.tags.forEach(function (tag, n) {
      var li = document.createElement('li');
      li.className = n === 0 ? 'sc-tag sc-tag--lime' : 'sc-tag';
      li.textContent = tag;
      tagList.appendChild(li);
    });
    if (byline) {
      byline.innerHTML = top.byline;
      byline.style.display = top.byline ? '' : 'none';
    }

    /* Cards: the rest, in their shuffled order. Each card keeps the lead's
       extra fields as data-* so a later reshuffle still has them. */
    Array.prototype.forEach.call(cards, function (card, n) {
      var d = stories[n + 1];
      card.setAttribute('href', d.href);
      card.setAttribute('data-tags', d.tags.join('|'));
      card.setAttribute('data-standfirst', d.standfirst);
      if (d.byline) card.setAttribute('data-byline', d.byline);
      else card.removeAttribute('data-byline');
      writeImg(card.querySelector('img'), d.img);
      card.querySelector('.story-card__scholar').textContent = d.scholar;
      card.querySelector('.story-card__title').innerHTML = d.title;
      card.querySelector('.story-card__meta').textContent = d.meta;
    });
  }

  /* ------------------------------------------------------------------------
     09c · FEATURE CAROUSEL  (scholars-experiences-list.html)
     Tabbed carousel: the stage holds one .story-lead per slide, the rail is
     a tablist that picks one. The order of the five is shuffled per load. Autoplay is driven by CSS, not a timer: the
     active tab's progress bar animates over --feature-interval, and its
     animationend moves to the next slide. Pausing is therefore just
     animation-play-state, so a resumed slide keeps the time it had left.

     Pauses while the pointer is over it, while a control has keyboard
     focus, and while the tab is hidden. The pause button stops it outright;
     with prefers-reduced-motion it starts stopped. Arrow keys / Home / End
     move between tabs, and the stage can be swiped on touch.
     ------------------------------------------------------------------------ */
  function featureCarousel() {
    var root = document.getElementById('feature-carousel');
    if (!root) return;

    var stage = root.querySelector('.feature-carousel__stage');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.feature-carousel__slide'));
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.feature-carousel__tab'));
    var toggle = root.querySelector('[data-feature-toggle]');
    var current = root.querySelector('[data-feature-current]');
    if (slides.length < 2 || slides.length !== tabs.length) return;

    /* Fresh running order on every load. Slide and tab move as a pair so
       each tab still sits at the same position as the slide it controls. */
    var order = slides.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    slides = order.map(function (i) { return slides[i]; });
    tabs = order.map(function (i) { return tabs[i]; });
    slides.forEach(function (slide, n) {
      stage.appendChild(slide);
      // Whichever story drew first place is the one worth loading eagerly
      var img = slide.querySelector('img');
      img.loading = n === 0 ? 'eager' : 'lazy';
      img.fetchPriority = n === 0 ? 'high' : 'auto';
    });
    tabs.forEach(function (tab) { tab.parentNode.appendChild(tab); });

    var INTERVAL = 7000;
    root.style.setProperty('--feature-interval', INTERVAL + 'ms');

    var index = 0;
    var stopped = prefersReducedMotion;   // pause button, or reduced motion
    var hovered = false, focused = false, hidden = document.hidden;

    function sync() {
      var paused = stopped || hovered || focused || hidden;
      root.classList.toggle('is-stopped', stopped);
      root.classList.toggle('is-paused', paused);
      // Announce slide changes only when they are the user's doing
      stage.setAttribute('aria-live', paused ? 'polite' : 'off');
      if (toggle) toggle.setAttribute('aria-label', stopped ? 'Play the carousel' : 'Pause the carousel');
    }

    function go(next, focus) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
      if (current) current.textContent = String(index + 1);
      if (focus) tabs[index].focus();
    }

    root.addEventListener('animationend', function (e) {
      if (e.animationName !== 'feature-progress') return;
      if (!tabs[index].contains(e.target)) return;
      go(index + 1);
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { go(i); });
    });

    root.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
      var to = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = index + 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = index - 1;
      if (e.key === 'Home') to = 0;
      if (e.key === 'End') to = slides.length - 1;
      if (to === null) return;
      e.preventDefault();
      go(to, true);
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        stopped = !stopped;
        // Restarting from stopped gives the current slide its full time back
        if (!stopped) go(index);
        sync();
      });
    }

    // Mouse only: a tap fires pointerenter with no matching leave on touch
    root.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { hovered = true; sync(); }
    });
    root.addEventListener('pointerleave', function () { hovered = false; sync(); });

    // Keyboard focus only, so a tap on a tab doesn't park the carousel
    root.addEventListener('focusin', function (e) {
      focused = e.target.matches(':focus-visible');
      sync();
    });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { focused = false; sync(); }
    });

    document.addEventListener('visibilitychange', function () {
      hidden = document.hidden;
      sync();
    });

    /* Touch swipe on the stage. The slides are links, so past the threshold
       we swallow the click that follows the swipe. */
    var SWIPE_MIN = 40;
    var startX = 0, startY = 0, dragging = false, swiped = false;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
      swiped = false;
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) dragging = false;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) >= SWIPE_MIN) {
        swiped = true;
        go(dx < 0 ? index + 1 : index - 1);
      }
    });
    stage.addEventListener('touchcancel', function () { dragging = false; });
    stage.addEventListener('click', function (e) {
      if (swiped) { e.preventDefault(); swiped = false; }
    });

    go(0);
    sync();
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

    /* A tab the reader picks is written to the URL as its panel's anchor
       (#requirements, #the-work…) so the link can be shared or bookmarked.
       replaceState rather than location.hash: no jump to the panel, and no
       history entry per click. */
    function pickTab(i, focus) {
      select(i, focus);
      var id = tabs[i].getAttribute('aria-controls');
      if (window.history && history.replaceState && window.location.hash !== '#' + id) {
        history.replaceState(null, '', '#' + id);
      }
    }

    allTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var i = tabs.indexOf(tab);
        if (i === -1) return;
        pickTab(i, false);
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
      pickTab(next, true);
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
     11 · CONTACT FORM  (contact-us.html only)
     Validates the four required fields on blur and on submit. A field is
     re-checked as you type only once it has been flagged, so the first pass
     through the form is never interrupted. Nothing is sent yet — see the
     marked block below.
     ------------------------------------------------------------------------ */
  function contactForm() {
    var form = document.getElementById('contact-form');
    var success = document.getElementById('contact-success');
    if (!form) return;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var fields = Array.prototype.slice.call(form.querySelectorAll('[required]'));

    function valid(input) {
      var value = input.value.trim();
      if (!value) return false;
      if (input.type === 'email') return EMAIL.test(value);
      return true;
    }

    function check(input) {
      var ok = valid(input);
      var wrap = input.closest('.sc-field');
      if (wrap) wrap.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }

    fields.forEach(function (input) {
      input.addEventListener('blur', function () { check(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') check(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (input) {
        if (!check(input) && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      /* ---- REPLACE: send the form to a real endpoint here, then show the
              confirmation only once the server has accepted it. ---- */
      form.hidden = true;
      if (success) {
        success.classList.add('is-visible');
        success.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     12 · AUTH MODAL
     The header's single Login / Register button opens a small dialog with
     the two social sign-in options. One flow covers both cases: the provider
     returns an existing account or creates a new one. Nothing is wired to a
     real OAuth client yet — replace signIn() with your Google / Facebook SDK
     calls (or redirects to your auth endpoints).
     ------------------------------------------------------------------------ */
  function authModal() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-auth-open]'));
    if (!triggers.length) return;

    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"/>' +
      '<path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z"/>' +
      '<path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4.01-3.11z"/>' +
      '<path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"/>' +
    '</svg>';
    var ICON_FACEBOOK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>';

    var modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'auth-modal-title');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="auth-modal__panel">' +
        '<button type="button" class="auth-modal__close" aria-label="Close">' + ICON_CLOSE + '</button>' +
        '<h2 id="auth-modal-title" class="auth-modal__title">Login or Register</h2>' +
        '<p class="auth-modal__lede">Continue with your Google or Facebook account.</p>' +
        '<div class="auth-modal__providers">' +
          '<button type="button" class="auth-btn auth-btn--google" data-auth-provider="google">' + ICON_GOOGLE + '<span>Continue with Google</span></button>' +
          '<button type="button" class="auth-btn auth-btn--facebook" data-auth-provider="facebook">' + ICON_FACEBOOK + '<span>Continue with Facebook</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var panel = modal.querySelector('.auth-modal__panel');
    var btnClose = modal.querySelector('.auth-modal__close');
    var lastFocused = null;
    var isOpen = false;

    function open() {
      lastFocused = document.activeElement;
      isOpen = true;
      modal.hidden = false;
      /* Next frame, so the opacity transition has a starting value. */
      requestAnimationFrame(function () {
        if (isOpen) modal.classList.add('is-open');
      });
      document.body.classList.add('is-modal-open');
      modal.querySelector('.auth-btn').focus();
    }

    function close() {
      isOpen = false;
      modal.classList.remove('is-open');
      document.body.classList.remove('is-modal-open');
      window.setTimeout(function () { if (!isOpen) modal.hidden = true; }, prefersReducedMotion ? 0 : 260);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    /* Placeholder: swap for the real Google / Facebook sign-in. */
    function signIn(provider) {
      window.console && console.info('[auth] sign in with ' + provider + ' — not wired up yet');
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    btnClose.addEventListener('click', close);
    modal.querySelectorAll('[data-auth-provider]').forEach(function (btn) {
      btn.addEventListener('click', function () { signIn(btn.getAttribute('data-auth-provider')); });
    });

    /* Click the backdrop (but not the panel) to dismiss. */
    modal.addEventListener('click', function (e) {
      if (!panel.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      /* Keep focus inside the dialog while it is open. */
      var focusable = modal.querySelectorAll('button');
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
  }

  /* ------------------------------------------------------------------------
     12b · SITE SEARCH OVERLAY
     The header search button opens a full-screen frosted overlay with one
     query field. It submits a GET to SEARCH_ACTION with ?q=, which
     searchResults() (15) reads and renders.
     ------------------------------------------------------------------------ */
  function searchOverlay() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('.site-header__search-btn'));
    if (!triggers.length) return;

    var SEARCH_ACTION = 'search-results.html';
    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_SEARCH = '<svg class="search-form__query-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>';

    var overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Search the site');
    overlay.hidden = true;
    overlay.innerHTML =
      '<button type="button" class="search-overlay__close" aria-label="Close search">' + ICON_CLOSE + '</button>' +
      '<form class="search-overlay__form" action="' + SEARCH_ACTION + '" method="get" role="search">' +
        '<label class="sc-visually-hidden" for="search-overlay-query">Search Scholar’s Choice</label>' +
        '<div class="search-form__query-wrap">' +
          ICON_SEARCH +
          '<input class="sc-input" type="search" id="search-overlay-query" name="q" autocomplete="off" ' +
                 'placeholder="Search scholarships, providers, stories…" required>' +
        '</div>' +
        '<button class="sc-btn sc-btn--primary search-overlay__submit" type="submit">Search</button>' +
      '</form>';
    document.body.appendChild(overlay);

    var form = overlay.querySelector('form');
    var input = overlay.querySelector('input');
    var btnClose = overlay.querySelector('.search-overlay__close');
    var lastFocused = null;
    var isOpen = false;

    function open() {
      lastFocused = document.activeElement;
      isOpen = true;
      overlay.hidden = false;
      requestAnimationFrame(function () {
        if (isOpen) overlay.classList.add('is-open');
      });
      document.body.classList.add('is-modal-open');
      triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
      input.focus();
    }

    function close() {
      isOpen = false;
      overlay.classList.remove('is-open');
      document.body.classList.remove('is-modal-open');
      triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      window.setTimeout(function () { if (!isOpen) overlay.hidden = true; }, prefersReducedMotion ? 0 : 260);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    triggers.forEach(function (trigger) {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'search-overlay');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    btnClose.addEventListener('click', close);

    /* Don't submit an empty or whitespace-only query. */
    form.addEventListener('submit', function (e) {
      input.value = input.value.trim();
      if (!input.value) { e.preventDefault(); input.focus(); }
    });

    /* Click the frosted backdrop (but not the form) to dismiss. */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      /* Keep focus inside the overlay: close → input → submit. */
      var focusable = overlay.querySelectorAll('button, input');
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
  }

  /* ------------------------------------------------------------------------
     13. SHARE LINKS
     Each [data-share] link gets its network's share URL, built from the
     current page URL and <title>. With JS off they stay "#".

     Instagram has no web share URL, so it and Copy link both put the page
     URL on the clipboard and flash a "Copied" tooltip (css section 14). On
     phones with a native share sheet, Instagram opens that sheet instead.
     ------------------------------------------------------------------------ */
  function shareLinks() {
    var links = document.querySelectorAll('[data-share]');
    if (!links.length) return;

    /* Built on demand, not once at load: the tabs rewrite the URL's anchor,
       and a share should carry the tab the reader is looking at. */
    function shareUrl(type) {
      var url = encodeURIComponent(window.location.href);
      var title = encodeURIComponent(document.title);
      switch (type) {
        case 'facebook': return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
        case 'whatsapp': return 'https://wa.me/?text=' + title + '%20' + url;
        case 'telegram': return 'https://t.me/share/url?url=' + url + '&text=' + title;
        case 'linkedin': return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
        case 'email':    return 'mailto:?subject=' + title + '&body=' + url;
      }
      return null;
    }

    /* Screen readers hear the confirmation; the tooltip is visual only. */
    var live = document.createElement('span');
    live.className = 'sc-visually-hidden';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      /* Fallback for plain-http previews, where the Clipboard API is absent */
      return new Promise(function (resolve, reject) {
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(field);
        if (ok) resolve(); else reject();
      });
    }

    function flashCopied(btn) {
      btn.setAttribute('data-tooltip', 'Copied');
      btn.classList.add('is-copied');
      live.textContent = 'Link copied';
      clearTimeout(btn._copiedTimer);
      btn._copiedTimer = setTimeout(function () {
        btn.classList.remove('is-copied');
        live.textContent = '';
      }, 2000);
    }

    Array.prototype.forEach.call(links, function (link) {
      var type = link.getAttribute('data-share');
      if (shareUrl(type)) {
        link.setAttribute('href', shareUrl(type));
        /* Refreshed on press so the href is current before the browser follows it */
        var refresh = function () { link.setAttribute('href', shareUrl(type)); };
        link.addEventListener('pointerdown', refresh);
        link.addEventListener('click', refresh);
        return;
      }
      if (type !== 'copy' && type !== 'instagram') return;

      link.setAttribute('role', 'button');
      link.addEventListener('click', function (e) {
        e.preventDefault();
        if (type === 'instagram' && navigator.share && window.matchMedia('(pointer: coarse)').matches) {
          navigator.share({ title: document.title, url: window.location.href }).catch(function () {});
          return;
        }
        copyText(window.location.href).then(function () { flashCopied(link); }, function () {});
      });
    });
  }

  /* ------------------------------------------------------------------------
     14 · SCHOLARSHIP LISTING
     scholarships.html. Renders .scholarship-card markup from window.SC_DATA
     (js/scholarship-data.js), PAGE_SIZE at a time, and loads the next page when
     #listing-sentinel scrolls into view. Filters apply as soon as they
     change and are mirrored to the query string, so any view can be shared
     and the homepage search can land here with ?q=…&level=… set.

     The form controls are the only state: getState() reads them, readUrl()
     writes into them. fetchPage() is the swap point for a real API — it
     already returns { items, total } asynchronously.

     Under 900px the aside is a drawer; its "Filter" handle toggles it.
     ------------------------------------------------------------------------ */
  function scholarshipListing() {
    var root = document.getElementById('scholarship-listing');
    var form = document.getElementById('listing-filters-form');
    var data = window.SC_DATA;
    if (!root || !form || !data) return;

    var PAGE_SIZE = 12;
    var LIST_FILTERS = ['provider', 'course', 'level', 'value', 'nationality', 'location'];
    var drawerQuery = window.matchMedia('(max-width: 900px)');
    var slice = Array.prototype.slice;

    var providers = data.providers || {};
    var all = data.scholarships || [];

    var searchForm = document.getElementById('listing-search');
    var query = document.getElementById('listing-query');
    var results = document.getElementById('listing-results');
    var grid = document.getElementById('listing-grid');
    var countEl = document.getElementById('listing-count');
    var statusEl = document.getElementById('listing-status');
    var sentinel = document.getElementById('listing-sentinel');
    var emptyEl = document.getElementById('listing-empty');
    var chipList = document.getElementById('listing-selected-list');
    var chipEmpty = document.getElementById('listing-selected-empty');
    var aside = document.getElementById('listing-filters');
    var handle = document.getElementById('listing-filters-handle');
    var backdrop = document.getElementById('listing-filters-backdrop');
    var sliders = slice.call(form.querySelectorAll('.step-slider__input'));
    var multis = slice.call(form.querySelectorAll('.multi-select'));

    var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>';
    var TAGS = {
      soon: '<span class="sc-tag sc-tag--lime">Closing soon</span>',
      open: '<span class="sc-tag">Open</span>',
      'new': '<span class="sc-tag sc-tag--accent">New</span>'
    };

    function esc(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    // "Full fees + $6k a year" → "full-fees-6k-a-year", a URL-safe key
    function valueKey(text) {
      return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    // Value options: one per distinct card value, built before labels are read
    var valueOptions = form.querySelector('#ms-value .multi-select__options');
    if (valueOptions) {
      var seenValues = {};
      all.forEach(function (s) {
        if (!s.value) return;
        s._valueKey = valueKey(s.value);
        seenValues[s._valueKey] = s.value;
      });
      valueOptions.innerHTML = Object.keys(seenValues)
        .sort(function (a, b) { return seenValues[a].localeCompare(seenValues[b]); })
        .map(function (key) {
          return '<li><label class="sc-check"><input type="checkbox" name="value" value="' + esc(key) + '"><span>' +
                 esc(seenValues[key]) + '</span></label></li>';
        }).join('');
    }

    // labels.course['data-ai'] → "Data Science & AI", read off the checkboxes
    var labels = {};
    slice.call(form.querySelectorAll('input[type="checkbox"]')).forEach(function (input) {
      (labels[input.name] = labels[input.name] || {})[input.value] = input.parentNode.textContent.trim();
    });

    function bondText(s) {
      if (s.bondText) return s.bondText;
      return s.bond === 0 ? 'No bond' : s.bond + (s.bond === 1 ? ' year' : ' years');
    }

    // Everything free-text search can hit, built once per scholarship
    all.forEach(function (s) {
      var named = function (group, values) {
        return (values || []).map(function (v) { return (labels[group] || {})[v] || v; });
      };
      s._text = [s.name, (providers[s.provider] || {}).name, s.value, s.level, s.study, bondText(s), s.keywords || '']
        .concat(named('course', s.courses), named('level', s.levels), named('location', s.location))
        .join(' ').toLowerCase();
    });

    /* --- State ------------------------------------------------------------ */
    function checkedValues(name) {
      return slice.call(form.querySelectorAll('input[name="' + name + '"]:checked'))
        .map(function (input) { return input.value; });
    }
    function sliderValue(input) { return Number(input.dataset.values.split(',')[input.value]); }
    function sliderIsSet(input) { return input.value !== input.defaultValue; }

    function getState() {
      var state = { q: query ? query.value.trim() : '' };
      LIST_FILTERS.forEach(function (name) { state[name] = checkedValues(name); });
      sliders.forEach(function (input) { state[input.name] = sliderValue(input); });
      return state;
    }

    function overlaps(a, b) {
      for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) > -1) return true;
      return false;
    }

    // AND across filter groups, OR within one; every search word must hit
    function matches(s, state) {
      if (state.q) {
        var words = state.q.toLowerCase().split(/\s+/);
        for (var i = 0; i < words.length; i++) if (s._text.indexOf(words[i]) < 0) return false;
      }
      if (state.provider.length && state.provider.indexOf(s.provider) < 0) return false;
      if (state.course.length && !overlaps(state.course, s.courses || [])) return false;
      if (state.level.length && !overlaps(state.level, s.levels || [])) return false;
      if (state.nationality.length && !overlaps(state.nationality, s.nationality || [])) return false;
      if (state.location.length && !overlaps(state.location, s.location || [])) return false;
      if (state.value.length && state.value.indexOf(s._valueKey) < 0) return false;
      if (s.bond > state.bond) return false;
      return true;
    }

    /* SWAP POINT — replace the body with a request to the search API, e.g.
       fetch('/api/scholarships?' + params + '&offset=' + offset + '&limit=12')
       resolving to { items: [...], total: n }. The delay on later pages
       stands in for network time so the loader is visible in review. */
    function fetchPage(state, offset) {
      var matched = all.filter(function (s) { return matches(s, state); });
      return new Promise(function (resolve) {
        window.setTimeout(function () {
          resolve({ items: matched.slice(offset, offset + PAGE_SIZE), total: matched.length });
        }, offset && !prefersReducedMotion ? 450 : 0);
      });
    }

    /* --- Cards ------------------------------------------------------------ */
    function card(s, i) {
      var p = providers[s.provider] || { name: s.provider, mono: '' };
      var logo = p.logo
        ? '<span class="scholarship-card__provider-logo"><img src="' + esc(p.logo) + '" alt="' + esc(p.name) + ' logo" loading="lazy" decoding="async"></span>'
        : '<span class="scholarship-card__provider-logo scholarship-card__provider-logo--mono" role="img" aria-label="' + esc(p.name) + '">' + esc(p.mono) + '</span>';
      var spec = function (label, value) {
        return '<div><p class="scholarship-card__spec-label">' + label + '</p>' +
               '<p class="scholarship-card__spec-value">' + esc(value) + '</p></div>';
      };
      return '<article class="scholarship-card" style="--i: ' + i + '">' +
        '<div class="scholarship-card__head">' + logo + (TAGS[s.tag] || '') + '</div>' +
        '<h3 class="scholarship-card__name">' + esc(s.name) + '</h3>' +
        '<div class="scholarship-card__body"><div class="scholarship-card__specs">' +
          spec('Value', s.value) + spec('Bond', bondText(s)) + spec('Study level', s.level) + spec('Study location', s.study) +
        '</div></div>' +
        '<div class="scholarship-card__foot">' +
          '<p class="scholarship-card__deadline">' + esc(s.deadline) + '</p>' +
          '<a class="sc-arrow-link scholarship-card__link" href="' + esc(s.url || 'scholarship-template.html') + '">Details' +
            '<span class="sc-visually-hidden"> — ' + esc(s.name) + '</span>' + ICON_ARROW + '</a>' +
        '</div>' +
      '</article>';
    }

    /* --- Paging ----------------------------------------------------------- */
    var state = getState();
    var shown = 0;
    var total = 0;
    var loading = false;
    var version = 0;

    function plural(n) { return n === 1 ? ' scholarship' : ' scholarships'; }

    function updateStatus() {
      emptyEl.hidden = total > 0;
      grid.hidden = total === 0;

      countEl.innerHTML = total
        ? 'Showing <strong>' + shown + '</strong> of <strong>' + total + '</strong>' + plural(total)
        : 'No scholarships found';

      if (loading && shown) {
        statusEl.innerHTML = '<span class="listing-status__spinner" aria-hidden="true"></span>Loading more scholarships';
      } else if (total > PAGE_SIZE && shown >= total) {
        statusEl.textContent = 'You’ve seen all ' + total + plural(total);
      } else {
        statusEl.textContent = '';
      }

      slice.call(document.querySelectorAll('[data-filters-apply]')).forEach(function (btn) {
        btn.textContent = total ? 'Show ' + total + plural(total) : 'No matches — adjust filters';
      });
    }

    function append(items) {
      grid.insertAdjacentHTML('beforeend', items.map(card).join(''));
      shown += items.length;
    }

    // Filters changed: fetch page one, then swap the grid in one go
    function refresh() {
      var v = ++version;
      loading = true;
      fetchPage(state, 0).then(function (page) {
        if (v !== version) return;
        grid.innerHTML = '';
        shown = 0;
        total = page.total;
        append(page.items);
        loading = false;
        updateStatus();
        if (!aside.classList.contains('is-open')) scrollToResults();
        checkSentinel();
      });
    }

    function loadMore() {
      if (loading || shown >= total) return;
      var v = version;
      loading = true;
      updateStatus();
      fetchPage(state, shown).then(function (page) {
        if (v !== version) return;
        append(page.items);
        loading = false;
        updateStatus();
        checkSentinel();
      });
    }

    // A tall screen can show the sentinel straight after a batch lands, which
    // the observer will not report again — so check by hand.
    function checkSentinel() {
      if (sentinel.getBoundingClientRect().top < window.innerHeight + 300) loadMore();
    }

    // Only when the top of the results has scrolled away, so filtering from
    // the top of the page never jumps
    function scrollToResults() {
      if (results.getBoundingClientRect().top < 0) {
        results.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) loadMore();
      }, { rootMargin: '0px 0px 300px 0px' }).observe(sentinel);
    } else {
      window.addEventListener('scroll', checkSentinel, { passive: true });
    }

    /* --- Selected filters ------------------------------------------------- */
    function sliderChip(input) {
      var v = sliderValue(input);
      if (input.name === 'bond') return v === 0 ? 'No bond' : 'Bond up to ' + v + (v === 1 ? ' year' : ' years');
      return input.dataset.labels.split('|')[input.value];
    }

    function renderChips() {
      var chips = [];
      if (state.q) chips.push({ name: 'q', value: '', text: '“' + state.q + '”' });
      LIST_FILTERS.forEach(function (name) {
        state[name].forEach(function (value) {
          chips.push({ name: name, value: value, text: labels[name][value] });
        });
      });
      sliders.forEach(function (input) {
        if (sliderIsSet(input)) chips.push({ name: input.name, value: '', text: sliderChip(input) });
      });

      chipList.innerHTML = chips.map(function (c) {
        return '<li><button class="listing-chip" type="button" data-chip-name="' + esc(c.name) + '" data-chip-value="' + esc(c.value) + '"' +
               ' aria-label="Remove filter: ' + esc(c.text) + '"><span>' + esc(c.text) + '</span>' + ICON_X + '</button></li>';
      }).join('');
      chipEmpty.hidden = chips.length > 0;

      slice.call(root.querySelectorAll('.listing-selected [data-filters-clear]')).forEach(function (btn) { btn.hidden = !chips.length; });
      slice.call(root.querySelectorAll('[data-filters-count]')).forEach(function (el) { el.textContent = chips.length ? '(' + chips.length + ')' : ''; });
      slice.call(root.querySelectorAll('[data-filters-badge]')).forEach(function (el) {
        el.hidden = !chips.length;
        el.textContent = chips.length;
      });
    }

    chipList.addEventListener('click', function (e) {
      var chip = e.target.closest('.listing-chip');
      if (!chip) return;
      var name = chip.getAttribute('data-chip-name');
      var value = chip.getAttribute('data-chip-value');
      if (name === 'q') {
        query.value = '';
      } else if (form.elements[name] && form.elements[name].type === 'range') {
        form.elements[name].value = form.elements[name].defaultValue;
        syncSlider(form.elements[name]);
      } else {
        var box = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (box) box.checked = false;
      }
      update(0);
      // The chip is gone; hand focus to the next one rather than to <body>
      var next = chipList.querySelector('.listing-chip');
      if (next) next.focus();
    });

    slice.call(root.querySelectorAll('[data-filters-clear]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        form.reset();
        if (query) query.value = '';
        sliders.forEach(syncSlider);
        update(0);
      });
    });

    /* --- Controls --------------------------------------------------------- */
    function syncSlider(input) {
      var index = Number(input.value);
      var text = input.dataset.labels.split('|')[index];
      input.style.setProperty('--p', index / Number(input.max));
      input.setAttribute('aria-valuetext', text);
      var out = document.getElementById(input.getAttribute('aria-describedby'));
      if (out) out.textContent = text;
      slice.call(input.parentNode.querySelectorAll('.step-slider__ticks li')).forEach(function (li, i) {
        li.classList.toggle('is-current', i === index);
      });
    }

    function syncMulti(ms) {
      var values = slice.call(ms.querySelectorAll('input:checked')).map(function (input) {
        return input.parentNode.textContent.trim();
      });
      ms.querySelector('.multi-select__value').textContent =
        values.length === 0 ? ms.getAttribute('data-placeholder')
        : values.length === 1 ? values[0]
        : values.length + ' selected';
      ms.classList.toggle('has-value', values.length > 0);
    }

    function setMulti(ms, open) {
      var toggle = ms.querySelector('.multi-select__toggle');
      var panel = ms.querySelector('.multi-select__panel');
      var search = ms.querySelector('.multi-select__search');
      if (open) multis.forEach(function (other) { if (other !== ms) setMulti(other, false); });
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (search) {
        if (open && !window.matchMedia('(pointer: coarse)').matches) search.focus();
        if (!open && search.value) { search.value = ''; filterOptions(ms, ''); }
      }
    }

    function filterOptions(ms, term) {
      term = term.trim().toLowerCase();
      var any = false;
      slice.call(ms.querySelectorAll('.multi-select__options li')).forEach(function (li) {
        var hit = li.textContent.toLowerCase().indexOf(term) > -1;
        li.hidden = !hit;
        any = any || hit;
      });
      var none = ms.querySelector('.multi-select__none');
      if (none) none.hidden = any;
    }

    multis.forEach(function (ms) {
      var toggle = ms.querySelector('.multi-select__toggle');
      var search = ms.querySelector('.multi-select__search');
      toggle.addEventListener('click', function () {
        setMulti(ms, toggle.getAttribute('aria-expanded') !== 'true');
      });
      if (search) {
        search.addEventListener('input', function () { filterOptions(ms, search.value); });
        // Enter in the search box ticks the only remaining option
        search.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          var visible = ms.querySelectorAll('.multi-select__options li:not([hidden]) input');
          if (visible.length === 1) { visible[0].checked = !visible[0].checked; update(0); }
        });
      }
      ms.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
        e.stopPropagation();
        setMulti(ms, false);
        toggle.focus();
      });
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('.multi-select')) return;
      multis.forEach(function (ms) { setMulti(ms, false); });
    });

    /* --- Wiring ----------------------------------------------------------- */
    var timer;
    function update(delay) {
      window.clearTimeout(timer);
      multis.forEach(syncMulti);
      timer = window.setTimeout(function () {
        state = getState();
        renderChips();
        writeUrl();
        refresh();
      }, delay);
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('input', function (e) {
      var t = e.target;
      if (t.classList.contains('multi-select__search')) return;
      if (t.type === 'range') { syncSlider(t); update(150); return; }
      update(0);
    });

    if (searchForm && query) {
      query.addEventListener('input', function () { update(250); });
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        update(0);
        if (window.matchMedia('(pointer: coarse)').matches) query.blur();
      });
    }

    /* --- URL -------------------------------------------------------------- */
    function writeUrl() {
      var params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      LIST_FILTERS.forEach(function (name) {
        if (state[name].length) params.set(name, state[name].join(','));
      });
      sliders.forEach(function (input) {
        if (sliderIsSet(input)) params.set(input.name, sliderValue(input));
      });
      var qs = params.toString().replace(/%2C/g, ',');
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }

    // Accepts values (?level=ug) or labels (?level=Undergraduate — what the
    // homepage search's study level <select> submits)
    function readUrl() {
      var params = new URLSearchParams(window.location.search);
      if (query && params.has('q')) query.value = params.get('q');
      LIST_FILTERS.forEach(function (name) {
        var raw = params.get(name);
        if (!raw) return;
        raw.split(',').forEach(function (v) {
          v = v.trim().toLowerCase();
          slice.call(form.querySelectorAll('input[name="' + name + '"]')).forEach(function (input) {
            if (input.value === v || labels[name][input.value].toLowerCase() === v) input.checked = true;
          });
        });
      });
      sliders.forEach(function (input) {
        var index = input.dataset.values.split(',').indexOf(params.get(input.name));
        if (index > -1) input.value = index;
      });
    }

    /* --- Drawer (under 900px) --------------------------------------------- */
    function drawerOpen() { return aside.classList.contains('is-open'); }

    function setDrawer(open) {
      if (open && !drawerQuery.matches) return;
      aside.classList.toggle('is-open', open);
      handle.setAttribute('aria-expanded', String(open));
      handle.setAttribute('aria-label', open ? 'Close filters' : 'Open filters');
      document.body.classList.toggle('is-filters-open', open);
      if (open) {
        backdrop.hidden = false;
        requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
        var close = aside.querySelector('.listing-filters__close');
        window.setTimeout(function () { close.focus(); }, prefersReducedMotion ? 0 : 60);
      } else {
        backdrop.classList.remove('is-visible');
        window.setTimeout(function () { if (!drawerOpen()) backdrop.hidden = true; }, prefersReducedMotion ? 0 : 260);
      }
    }

    handle.addEventListener('click', function () { setDrawer(!drawerOpen()); });
    backdrop.addEventListener('click', function () { setDrawer(false); });
    slice.call(aside.querySelectorAll('[data-filters-close]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        setDrawer(false);
        if (btn.hasAttribute('data-filters-apply')) {
          scrollToResults();
          countEl.focus({ preventScroll: true });
        } else {
          handle.focus();
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerOpen()) { setDrawer(false); handle.focus(); }
    });
    drawerQuery.addEventListener('change', function (e) { if (!e.matches) setDrawer(false); });

    /* --- Boot ------------------------------------------------------------- */
    readUrl();
    sliders.forEach(syncSlider);
    update(0);
  }

  /* ------------------------------------------------------------------------
     15 · SEARCH RESULTS
     search-results.html. Reads ?q=, matches it against the #search-index
     JSON and renders one .search-result row per hit, matched words marked.
     Every word of the query must appear somewhere in the entry; hits in the
     title rank above hits elsewhere, then index order breaks ties.
     ------------------------------------------------------------------------ */
  function searchResults() {
    var list = document.getElementById('search-list');
    var dataEl = document.getElementById('search-index');
    if (!list || !dataEl) return;

    var titleEl = document.getElementById('search-title');
    var countEl = document.getElementById('search-count');
    var emptyEl = document.getElementById('search-empty');
    var emptyTitle = document.getElementById('search-empty-title');
    var emptyText = document.getElementById('search-empty-text');
    var refine = document.getElementById('search-refine-query');
    var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>';

    var index = [];
    try { index = JSON.parse(dataEl.textContent); } catch (err) { index = []; }

    var query = (new URLSearchParams(window.location.search).get('q') || '').trim().replace(/\s+/g, ' ');
    var terms = query ? query.toLowerCase().split(' ') : [];

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function escapeRegExp(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    /* Longest terms first so "dsta" wins over "ds" inside the same word. */
    var markRe = terms.length
      ? new RegExp('(' + terms.slice().sort(function (a, b) { return b.length - a.length; }).map(escapeRegExp).join('|') + ')', 'gi')
      : null;
    function highlight(str) {
      var safe = escapeHtml(str);
      return markRe ? safe.replace(markRe, '<mark>$1</mark>') : safe;
    }

    if (refine) refine.value = query;
    if (titleEl) titleEl.textContent = query || 'Search';
    if (query) document.title = '“' + query + '” — Search results — Scholar’s Choice';

    function showEmpty(title, text) {
      list.hidden = true;
      emptyEl.hidden = false;
      emptyTitle.textContent = title;
      emptyText.textContent = text;
    }

    if (!terms.length) {
      countEl.textContent = 'Type a word or two above to search the site.';
      showEmpty('What are you looking for?', 'Search for a scholarship, a provider, a course or a scholar’s story.');
      return;
    }

    var hits = [];
    index.forEach(function (item, i) {
      var title = (item.title || '').toLowerCase();
      var rest = [item.excerpt, item.type, item.keywords].join(' ').toLowerCase();
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        var inTitle = title.indexOf(terms[t]) !== -1;
        if (!inTitle && rest.indexOf(terms[t]) === -1) return;
        score += inTitle ? 3 : 1;
      }
      hits.push({ item: item, score: score, order: i });
    });
    hits.sort(function (a, b) { return b.score - a.score || a.order - b.order; });

    var q = '<strong>“' + escapeHtml(query) + '”</strong>';
    if (!hits.length) {
      countEl.innerHTML = 'No results for ' + q;
      showEmpty('Nothing found', 'Check the spelling, try fewer words, or search for a provider name.');
      return;
    }
    countEl.innerHTML = '<strong>' + hits.length + '</strong> result' + (hits.length === 1 ? '' : 's') + ' for ' + q;

    list.innerHTML = hits.map(function (hit, n) {
      var item = hit.item;
      return '<li class="search-result" style="--i:' + Math.min(n, 12) + '">' +
        '<div class="search-result__thumb' + (item.logo ? ' search-result__thumb--logo' : '') + '">' +
          '<img data-img-slot="search-' + hit.order + '" src="' + escapeHtml(item.image || '') + '" alt="" width="300" height="300" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="search-result__body">' +
          '<span class="sc-tag">' + escapeHtml(item.type || '') + '</span>' +
          '<h2 class="search-result__title"><a class="search-result__link" href="' + escapeHtml(item.url || '#') + '">' + highlight(item.title || '') + '</a></h2>' +
          (item.excerpt ? '<p class="search-result__excerpt">' + highlight(item.excerpt) + '</p>' : '') +
          '<span class="search-result__more" aria-hidden="true">Read more' + ICON_ARROW + '</span>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     16 · SCHOLARSHIP COMPARE
     comparison.html. Up to MAX scholarships from window.SC_DATA, picked
     with two single-select dropdowns (provider narrows scholarship). The
     selection list is the only state: render() rebuilds the head bar and
     the table from it, and save() mirrors it to ?ids= and localStorage.

     IN_VIEW columns fill the width; past that the table scrolls sideways
     with the next column peeking in. The head bar lives outside that
     scroller so it can stick to the page, and the two scroll together.
     ------------------------------------------------------------------------ */
  function scholarshipCompare() {
    var picker = document.getElementById('compare-picker');
    var data = window.SC_DATA;
    if (!picker || !data) return;

    var MAX = 5;
    var IN_VIEW = 3; // columns that fit before the table scrolls sideways
    var STORE_KEY = 'sc-compare';
    var slice = Array.prototype.slice;

    var providers = data.providers || {};
    var labels = data.labels || {};
    var all = data.scholarships || [];
    var byId = {};
    all.forEach(function (s) { byId[s.id] = s; });

    var providerSel = document.getElementById('compare-provider');
    var schSel = document.getElementById('compare-scholarship');
    var selects = [providerSel, schSel];
    var submit = document.getElementById('compare-submit');
    var hint = document.getElementById('compare-hint');
    var statusEl = document.getElementById('compare-status');
    var emptyEl = document.getElementById('compare-empty');
    var tableEl = document.getElementById('compare-table');
    var head = document.getElementById('compare-head');
    var scroller = document.getElementById('compare-scroller');
    var grid = document.getElementById('compare-grid');

    var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    var EMPTY = '<span aria-hidden="true">&mdash;</span><span class="sc-visually-hidden">Not stated</span>';

    function esc(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    var selected = [];
    var fresh = null; // the column just added, so only it animates in

    /* --- Dropdowns -------------------------------------------------------- */
    function optionHtml(name, value, text, attrs, extra) {
      return '<li data-label="' + esc(text) + '"' + (attrs || '') + '><label class="sc-check">' +
        '<input type="radio" name="' + name + '" value="' + esc(value) + '">' +
        '<span>' + esc(text) + (extra || '') + '</span></label></li>';
    }

    function byName(a, b) { return a.name.localeCompare(b.name); }

    // Only providers with at least one scholarship to pick
    var providerKeys = Object.keys(providers).filter(function (key) {
      return all.some(function (s) { return s.provider === key; });
    }).sort(function (a, b) { return byName(providers[a], providers[b]); });

    providerSel.querySelector('.multi-select__options').innerHTML =
      optionHtml('compare-provider', '', 'All providers') +
      providerKeys.map(function (key) { return optionHtml('compare-provider', key, providers[key].name); }).join('');
    providerSel.querySelector('input[value=""]').checked = true;

    schSel.querySelector('.multi-select__options').innerHTML = all.slice().sort(byName).map(function (s) {
      return optionHtml('compare-scholarship', s.id, s.name, ' data-provider="' + esc(s.provider) + '"',
        '<em class="compare-option__added" hidden>Added</em>');
    }).join('');

    function valueOf(ms) {
      var input = ms.querySelector('input:checked');
      return input ? input.value : '';
    }

    function syncValue(ms) {
      var input = ms.querySelector('input:checked');
      var set = input && input.value !== '';
      ms.querySelector('.multi-select__value').textContent =
        set ? input.closest('li').getAttribute('data-label') : ms.getAttribute('data-placeholder');
      ms.classList.toggle('has-value', !!set);
    }

    function filterOptions(ms) {
      var term = ms.querySelector('.multi-select__search').value.trim().toLowerCase();
      var provider = ms === schSel ? valueOf(providerSel) : '';
      var any = false;
      slice.call(ms.querySelectorAll('.multi-select__options li')).forEach(function (li) {
        var hit = li.getAttribute('data-label').toLowerCase().indexOf(term) > -1 &&
                  (!provider || li.getAttribute('data-provider') === provider);
        li.hidden = !hit;
        any = any || hit;
      });
      ms.querySelector('.multi-select__none').hidden = any;
    }

    function setOpen(ms, open) {
      var toggle = ms.querySelector('.multi-select__toggle');
      var panel = ms.querySelector('.multi-select__panel');
      var search = ms.querySelector('.multi-select__search');
      if (open) selects.forEach(function (other) { if (other !== ms) setOpen(other, false); });
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open && !window.matchMedia('(pointer: coarse)').matches) search.focus();
      if (!open && search.value) { search.value = ''; filterOptions(ms); }
    }

    function isOpen(ms) {
      return ms.querySelector('.multi-select__toggle').getAttribute('aria-expanded') === 'true';
    }

    function closeOnto(ms) {
      setOpen(ms, false);
      ms.querySelector('.multi-select__toggle').focus();
    }

    function onChange(ms) {
      syncValue(ms);
      if (ms === providerSel) {
        // A scholarship from another provider no longer fits the narrowed list
        var picked = schSel.querySelector('input:checked');
        var provider = valueOf(providerSel);
        if (picked && provider && byId[picked.value].provider !== provider) picked.checked = false;
        syncValue(schSel);
        filterOptions(schSel);
      }
      updatePicker();
    }

    selects.forEach(function (ms) {
      var toggle = ms.querySelector('.multi-select__toggle');
      var search = ms.querySelector('.multi-select__search');
      var options = ms.querySelector('.multi-select__options');

      toggle.addEventListener('click', function () { setOpen(ms, !isOpen(ms)); });
      search.addEventListener('input', function () { filterOptions(ms); });

      search.addEventListener('keydown', function (e) {
        var visible = slice.call(ms.querySelectorAll('.multi-select__options li:not([hidden]) input:not(:disabled)'));
        if (e.key === 'Enter') {
          // Enter picks the top match, so type-then-Enter is all it takes
          e.preventDefault();
          if (!visible.length) return;
          visible[0].checked = true;
          onChange(ms);
          closeOnto(ms);
        } else if (e.key === 'ArrowDown' && visible.length) {
          e.preventDefault();
          (visible.filter(function (input) { return input.checked; })[0] || visible[0]).focus();
        }
      });

      // Arrow keys move the selection without closing; a click or Enter
      // on an option picks it and closes.
      options.addEventListener('change', function () { onChange(ms); });
      options.addEventListener('click', function (e) {
        var label = e.target.closest('.sc-check');
        if (!label || e.detail === 0 || label.querySelector('input').disabled) return;
        window.setTimeout(function () { closeOnto(ms); }, 0);
      });
      options.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.target.type !== 'radio') return;
        e.preventDefault();
        if (!e.target.checked && !e.target.disabled) { e.target.checked = true; onChange(ms); }
        closeOnto(ms);
      });

      ms.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !isOpen(ms)) return;
        e.stopPropagation();
        closeOnto(ms);
      });
    });

    document.addEventListener('click', function (e) {
      selects.forEach(function (ms) { if (!ms.contains(e.target)) setOpen(ms, false); });
    });
    // Tabbing out of an open dropdown closes it
    document.addEventListener('focusin', function (e) {
      selects.forEach(function (ms) { if (isOpen(ms) && !ms.contains(e.target)) setOpen(ms, false); });
    });

    function updatePicker() {
      var full = selected.length >= MAX;
      submit.disabled = full || !valueOf(schSel);
      hint.textContent = full
        ? 'Remove one to add another (max ' + MAX + ').'
        : selected.length
          ? 'Add up to ' + (MAX - selected.length) + ' more.'
          : 'Choose a scholarship to add it to the table.';

      slice.call(schSel.querySelectorAll('.multi-select__options li')).forEach(function (li) {
        var input = li.querySelector('input');
        var added = selected.indexOf(input.value) > -1;
        input.disabled = added;
        li.querySelector('.compare-option__added').hidden = !added;
      });
    }

    /* --- Table ------------------------------------------------------------ */
    function bondText(s) {
      if (s.bondText) return s.bondText;
      return s.bond === 0 ? 'No bond' : s.bond + (s.bond === 1 ? ' year' : ' years');
    }

    function named(group, values) {
      return (values || []).map(function (v) { return (labels[group] || {})[v] || v; });
    }

    function text(value) {
      return value === undefined || value === null || value === '' ? EMPTY : esc(value);
    }

    function list(values) {
      if (!values.length) return EMPTY;
      if (values.length === 1) return esc(values[0]);
      return '<ul class="compare-list">' + values.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul>';
    }

    // Row labels are the site-wide names: the same words the scholarship
    // cards, the scholarship page and the listing filters use.
    var ROWS = [
      ['Provider', function (s) { return text((providers[s.provider] || {}).name); }],
      ['Value', function (s) { return text(s.value); }],
      ['Bond', function (s) { return typeof s.bond === 'number' || s.bondText ? esc(bondText(s)) : EMPTY; }],
      ['Study level', function (s) { return list(named('level', s.levels)); }],
      ['Study location', function (s) { return text(s.study); }],
      ['Courses', function (s) { return list(named('course', s.courses)); }],
      ['Nationality', function (s) { return list(named('nationality', s.nationality)); }],
      ['Application deadline', function (s) { return text((s.deadline || '').replace(/^Closes\s+/i, '')); }]
    ];

    function logo(s) {
      var p = providers[s.provider] || { name: s.provider, mono: '' };
      return p.logo
        ? '<span class="scholarship-card__provider-logo compare-col__logo" aria-hidden="true"><img src="' + esc(p.logo) + '" alt="" decoding="async"></span>'
        : '<span class="scholarship-card__provider-logo scholarship-card__provider-logo--mono compare-col__logo" aria-hidden="true">' + esc(p.mono) + '</span>';
    }

    function render() {
      var count = selected.length;
      emptyEl.hidden = count > 0;
      tableEl.hidden = count === 0;
      updatePicker();
      if (!count) { head.innerHTML = ''; grid.innerHTML = ''; return; }

      var items = selected.map(function (id) { return byId[id]; });
      var isNew = function (s) { return s.id === fresh ? ' is-new' : ''; };

      // Desktop fills IN_VIEW columns with free slots. Past IN_VIEW it scrolls,
      // with one free slot after the last scholarship until MAX is reached.
      // Under 900px only one free slot shows (--compare-cols-sm).
      var cols = count < IN_VIEW ? IN_VIEW : Math.min(count + (count > IN_VIEW ? 1 : 0), MAX);
      tableEl.style.setProperty('--compare-cols', cols);
      tableEl.style.setProperty('--compare-cols-sm', Math.min(count + 1, MAX));
      tableEl.classList.toggle('is-scrollable', cols > IN_VIEW);

      var slots = '';
      for (var i = count; i < cols; i++) {
        slots += '<li class="compare-col compare-col--slot"><button class="compare-col__add" type="button" data-compare-add>' +
                 ICON_PLUS + '<span>Add a scholarship</span></button></li>';
      }

      head.innerHTML =
        '<p class="compare-head__meta"><span><strong>' + count + '</strong> of ' + MAX + ' selected</span></p>' +
        '<ul class="compare-head__cols" aria-label="Scholarships in this comparison">' +
          items.map(function (s) {
            return '<li class="compare-col' + isNew(s) + '">' +
              '<button class="compare-col__remove" type="button" data-compare-remove="' + esc(s.id) + '"' +
                ' aria-label="Remove ' + esc(s.name) + ' from comparison">' + ICON_X + '</button>' +
              logo(s) +
              '<a class="compare-col__name" href="' + esc(s.url || 'scholarship-template.html') + '">' + esc(s.name) + '</a>' +
            '</li>';
          }).join('') + slots +
        '</ul>';

      // Rows are display:grid, which strips table semantics in some screen
      // readers — the explicit roles put them back.
      grid.innerHTML =
        '<caption class="sc-visually-hidden">Comparison of ' + count + (count === 1 ? ' scholarship' : ' scholarships') + '</caption>' +
        '<thead class="sc-visually-hidden" role="rowgroup"><tr role="row"><td role="cell"></td>' +
          items.map(function (s) { return '<th scope="col" role="columnheader">' + esc(s.name) + '</th>'; }).join('') +
        '</tr></thead>' +
        '<tbody role="rowgroup">' +
          ROWS.map(function (row) {
            return '<tr role="row"><th scope="row" role="rowheader"><span>' + row[0] + '</span></th>' +
              items.map(function (s) { return '<td role="cell" class="' + isNew(s).trim() + '">' + row[1](s) + '</td>'; }).join('') +
            '</tr>';
          }).join('') +
          '<tr class="compare-grid__cta" role="row"><th scope="row" role="rowheader"><span class="sc-visually-hidden">Apply or find out more</span></th>' +
            items.map(function (s) {
              return '<td role="cell" class="' + isNew(s).trim() + '"><div class="compare-ctas">' +
                '<a class="sc-btn sc-btn--primary sc-btn--sm sc-btn--block" href="' + esc(s.applyUrl || '#') + '" data-cta="apply" target="_blank" rel="noopener">' +
                  'Apply now<span class="sc-visually-hidden"> &mdash; ' + esc(s.name) + ' (opens in a new tab)</span></a>' +
                '<a class="sc-btn sc-btn--secondary sc-btn--sm sc-btn--block" href="' + esc(s.url || 'scholarship-template.html') + '">' +
                  'More details<span class="sc-visually-hidden"> &mdash; ' + esc(s.name) + '</span></a>' +
              '</div></td>';
            }).join('') +
          '</tr>' +
        '</tbody>';

      fresh = null;
      head.scrollLeft = scroller.scrollLeft;
    }

    /* --- State ------------------------------------------------------------ */
    function save() {
      var url = window.location.pathname + (selected.length ? '?ids=' + selected.join(',') : '') + window.location.hash;
      window.history.replaceState(null, '', url);
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(selected)); } catch (err) { /* private mode */ }
    }

    function load() {
      var params = new URLSearchParams(window.location.search);
      var ids = [];
      if (params.has('ids')) {
        ids = params.get('ids').split(',');
      } else {
        try { ids = JSON.parse(window.localStorage.getItem(STORE_KEY)) || []; } catch (err) { ids = []; }
      }
      var add = params.get('add');
      if (add && ids.indexOf(add) < 0) ids.push(add);
      ids.forEach(function (id) {
        if (byId[id] && selected.indexOf(id) < 0 && selected.length < MAX) selected.push(id);
      });
      // A full comparison drops the oldest so the scholarship being added shows
      if (add && byId[add] && selected.indexOf(add) < 0) { selected.shift(); selected.push(add); }
      save();
    }

    function announce(message) {
      statusEl.textContent = '';
      window.setTimeout(function () { statusEl.textContent = message; }, 50);
    }

    function add(id) {
      if (!byId[id] || selected.indexOf(id) > -1 || selected.length >= MAX) return;
      selected.push(id);
      fresh = id;
      var picked = schSel.querySelector('input:checked');
      if (picked) picked.checked = false;
      syncValue(schSel);
      save();
      render();
      // Bring the new column into view, wherever the table was scrolled to
      leader = null;
      scroller.scrollLeft = scroller.scrollWidth;
      announce(byId[id].name + ' added to comparison (' + selected.length + ' of ' + MAX + ')');
    }

    function remove(id) {
      var index = selected.indexOf(id);
      if (index < 0) return;
      selected.splice(index, 1);
      save();
      render();
      announce(byId[id].name + ' removed from comparison (' + selected.length + ' of ' + MAX + ')');
      // The button that had focus is gone: hand it to the neighbouring column
      var buttons = head.querySelectorAll('[data-compare-remove]');
      if (buttons.length) buttons[Math.min(index, buttons.length - 1)].focus();
      else providerSel.querySelector('.multi-select__toggle').focus();
    }

    picker.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = valueOf(schSel);
      if (!id) return;
      add(id);
      schSel.querySelector('.multi-select__toggle').focus();
    });

    head.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-compare-remove]');
      if (removeBtn) { remove(removeBtn.getAttribute('data-compare-remove')); return; }
      if (e.target.closest('[data-compare-add]')) {
        e.stopPropagation(); // the document handler would close the dropdown again
        picker.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        setOpen(schSel, true);
        if (window.matchMedia('(pointer: coarse)').matches) schSel.querySelector('.multi-select__toggle').focus();
      }
    });

    /* --- Head bar follows the sideways scroll ----------------------------- */
    // Whichever side the user last touched leads, so the two never fight
    // over a scroll position (the table snaps; the head bar does not).
    var leader = null;
    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(function (type) {
      head.addEventListener(type, function () { leader = head; }, { passive: true });
      scroller.addEventListener(type, function () { leader = scroller; }, { passive: true });
    });
    function follow(from, to) {
      return function () {
        if (leader && leader !== from) return;
        if (to.scrollLeft !== from.scrollLeft) to.scrollLeft = from.scrollLeft;
      };
    }
    head.addEventListener('scroll', follow(head, scroller), { passive: true });
    scroller.addEventListener('scroll', follow(scroller, head), { passive: true });

    load();
    render();
  }

  /* ------------------------------------------------------------------------
     17 · GUIDES & TIPS
     guide-and-tips.html. Reads the #guides-index JSON, sorts it newest
     first and renders PAGE_SIZE .search-result rows at a time; the next
     page loads when #guides-sentinel scrolls into view. fetchPage() is the
     swap point for a real API — it already resolves { items, total }.
     ------------------------------------------------------------------------ */
  function guidesList() {
    var list = document.getElementById('guides-list');
    var dataEl = document.getElementById('guides-index');
    if (!list || !dataEl) return;

    var PAGE_SIZE = 12;
    var statusEl = document.getElementById('guides-status');
    var sentinel = document.getElementById('guides-sentinel');
    var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-7 7 7-7 7"/></svg>';
    // Dates are shown in Singapore time. Month names are spelled out here
    // because en-SG gives "Sept" in some browsers and "Sep" in others.
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var isoFmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Singapore' });

    var all = [];
    try { all = JSON.parse(dataEl.textContent); } catch (err) { all = []; }
    all.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    function esc(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    /* SWAP POINT — replace with a request to the CMS, e.g.
       fetch('/api/resources?orderby=date&offset=' + offset + '&limit=12').
       The delay on later pages stands in for network time so the loader is
       visible in review. */
    function fetchPage(offset) {
      return new Promise(function (resolve) {
        window.setTimeout(function () {
          resolve({ items: all.slice(offset, offset + PAGE_SIZE), total: all.length });
        }, offset && !prefersReducedMotion ? 450 : 0);
      });
    }

    function row(item, n) {
      var d = new Date(item.date);
      var valid = !isNaN(d);
      var iso = valid ? isoFmt.format(d) : ''; // YYYY-MM-DD
      var label = valid ? +iso.slice(8) + ' ' + MONTHS[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4) : '';
      return '<li class="search-result guide-result" style="--i:' + n + '">' +
        '<div class="search-result__thumb">' +
          '<img src="' + esc(item.image || '') + '" alt="" width="300" height="200" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="search-result__body">' +
          (valid ? '<time class="guide-result__date" datetime="' + iso + '">' + label + '</time>' : '') +
          '<h3 class="search-result__title"><a class="search-result__link" href="' + esc(item.url || '#') + '">' + esc(item.title || '') + '</a></h3>' +
          (item.excerpt ? '<p class="search-result__excerpt">' + esc(item.excerpt) + '</p>' : '') +
          '<span class="search-result__more" aria-hidden="true">Read article' + ICON_ARROW + '</span>' +
        '</div>' +
      '</li>';
    }

    var shown = 0;
    var total = all.length;
    var loading = false;

    function updateStatus() {
      if (loading && shown) {
        statusEl.innerHTML = '<span class="listing-status__spinner" aria-hidden="true"></span>Loading more articles';
      } else if (total > PAGE_SIZE && shown >= total) {
        statusEl.textContent = 'You’ve seen all ' + total + ' articles';
      } else {
        statusEl.textContent = '';
      }
    }

    function loadMore() {
      if (loading || (shown && shown >= total)) return;
      loading = true;
      updateStatus();
      fetchPage(shown).then(function (page) {
        list.insertAdjacentHTML('beforeend', page.items.map(row).join(''));
        shown += page.items.length;
        total = page.total;
        loading = false;
        updateStatus();
        checkSentinel();
      });
    }

    // A tall screen can show the sentinel straight after a batch lands, which
    // the observer will not report again — so check by hand.
    function checkSentinel() {
      if (shown < total && sentinel.getBoundingClientRect().top < window.innerHeight + 300) loadMore();
    }

    // The observer's first report is taken before page one renders, and can
    // arrive after it has — so measure again rather than trust the entry.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) checkSentinel();
      }, { rootMargin: '0px 0px 300px 0px' }).observe(sentinel);
    } else {
      window.addEventListener('scroll', checkSentinel, { passive: true });
    }

    loadMore();
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
    storyList();
    featureCarousel();
    articleTabs();
    authModal();
    searchOverlay();
    contactForm();
    shareLinks();
    scholarshipListing();
    searchResults();
    scholarshipCompare();
    guidesList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
