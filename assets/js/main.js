(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });
})();

/* News & events slider.
   Card count is read from the DOM, so adding or removing a
   .news-clip-card in the markup is all that's needed. */
(function () {
  var slider = document.getElementById('newsSlider');
  if (!slider) return;

  var track = slider.querySelector('.news-track');
  var controls = slider.querySelector('.news-controls');
  var prevBtn = slider.querySelector('.news-prev');
  var nextBtn = slider.querySelector('.news-next');
  var dotsWrap = slider.querySelector('.news-dots');
  if (!track || !controls || !prevBtn || !nextBtn || !dotsWrap) return;

  var cards = track.querySelectorAll('.news-clip-card');
  if (!cards.length) return;

  var stopCount = 0;
  var ticking = false;

  // Distance from one card's start to the next (card width + gap).
  function step() {
    if (cards.length > 1) {
      var delta = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      if (delta > 0) return delta;
    }
    return cards[0].getBoundingClientRect().width || 1;
  }

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function currentIndex() {
    return Math.min(stopCount, Math.max(0, Math.round(track.scrollLeft / step())));
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (var i = 0; i <= stopCount; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to news slide ' + (i + 1));
      dot.dataset.index = String(i);
      dot.addEventListener('click', function () {
        track.scrollTo({ left: Number(this.dataset.index) * step(), behavior: 'smooth' });
      });
      dotsWrap.appendChild(dot);
    }
  }

  function paint() {
    var index = currentIndex();
    // Compare against scroll position, not index, so a partial last
    // slide still disables the arrow once the end is reached.
    prevBtn.disabled = track.scrollLeft <= 1;
    nextBtn.disabled = track.scrollLeft >= maxScroll() - 1;
    var dots = dotsWrap.children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].setAttribute('aria-selected', String(i === index));
    }
  }

  function measure() {
    var next = maxScroll() > 1 ? Math.round(maxScroll() / step()) : 0;
    if (next !== stopCount || dotsWrap.children.length !== next + 1) {
      stopCount = next;
      buildDots();
    }
    // Nothing to scroll (e.g. 3 cards on a 3-up desktop layout) — hide the controls.
    controls.hidden = stopCount === 0;
    paint();
  }

  prevBtn.addEventListener('click', function () {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', function () {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; paint(); });
  }, { passive: true });

  window.addEventListener('resize', measure);
  // Card heights depend on images, which can change scrollWidth after load.
  window.addEventListener('load', measure);
  measure();
})();
