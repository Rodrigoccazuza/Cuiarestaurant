document.addEventListener('DOMContentLoaded', () => {
  const finalLayoutStyles = document.createElement('link');
  finalLayoutStyles.rel = 'stylesheet';
  finalLayoutStyles.href = 'layout-fixes.css';
  document.head.appendChild(finalLayoutStyles);

  const menuVisibilityStyles = document.createElement('link');
  menuVisibilityStyles.rel = 'stylesheet';
  menuVisibilityStyles.href = 'menu-visibility-fixes.css';
  document.head.appendChild(menuVisibilityStyles);

  /* Remove the former standalone contact/map section and any navigation links
     that pointed to it. Contact details remain available in the footer. */
  document.querySelector('.contact')?.remove();
  document.querySelectorAll('a[href="#contact"]').forEach((link) => link.remove());

  const footer = document.querySelector('footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="images/logo.png" class="footer-logo" alt="Cuia Restaurant logo">
          <p class="footer-eyebrow">Amazonian cuisine</p>
          <h2>From the forest to your table.</h2>
          <p class="footer-description">A warm, modern celebration of Manaus flavors, ingredients, and hospitality.</p>
          <img src="images/socialicons.png" class="footer-social-icons" alt="Cuia Restaurant social media">
        </div>

        <nav class="footer-column" aria-label="Footer navigation">
          <p class="footer-heading">Explore</p>
          <a href="#about">Our Story</a>
          <a href="#menu">Menu</a>
          <a href="#reservation-modal" data-reservation-trigger>Reservations</a>
        </nav>

        <div class="footer-column">
          <p class="footer-heading">Hours</p>
          <p>Monday–Friday</p>
          <strong>11 AM–10 PM</strong>
          <p class="footer-spacer">Saturday–Sunday</p>
          <strong>10 AM–10 PM</strong>
        </div>

        <div class="footer-column footer-contact-column">
          <p class="footer-heading">Reservations</p>
          <a href="tel:+1617675657">617-675-657</a>
          <a href="mailto:cuiarestaurant@info.com">cuiarestaurant@info.com</a>
          <button type="button" class="footer-reservation-button" data-reservation-trigger>Reserve a table</button>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Cuia Restaurant. All rights reserved.</p>
        <a href="#top" class="footer-back-top" aria-label="Back to top">Back to top ↑</a>
      </div>
    `;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu cards are intentionally excluded from reveal opacity so their text is
     always visible. Images and headings still receive the reveal treatment. */
  const revealTargets = [
    ['.about .cuiasphotos', 'reveal-left'],
    ['.about .subheadline', 'reveal-right'],
    ['.about .about_paragraph', 'reveal-right'],
    ['.lines', ''],
    ['.appetizers .photo_container', 'reveal-right'],
    ['.maincourse .photo_container', 'reveal-left'],
    ['.desserts .photo_container', 'reveal-right'],
    ['.drinkmenu .photo_container', 'reveal-left']
  ];

  revealTargets.forEach(([selector, direction], index) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('reveal-on-scroll');
      if (direction) element.classList.add(direction);
      element.classList.add(`reveal-delay-${(index % 3) + 1}`);
    });
  });

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealElements.forEach((element) => observer.observe(element));
  }

  const modal = document.querySelector('#reservation-modal');
  const dialog = modal?.querySelector('.reservation-dialog');
  const form = modal?.querySelector('#reservation-form');
  const closeButton = modal?.querySelector('.modal-close');
  const status = modal?.querySelector('.form-status');
  const triggers = document.querySelectorAll('[data-reservation-trigger]');
  let lastFocusedElement = null;

  const openModal = (event) => {
    event?.preventDefault();
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.setTimeout(() => modal.querySelector('input')?.focus(), 80);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocusedElement?.focus();
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', openModal));
  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  dialog?.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  const dateInput = form?.querySelector('#reservation-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const subject = `Reservation Request — ${data.get('reservation-date')} at ${data.get('reservation-time')}`;
    const body = [
      'Hello Cuia Restaurant,',
      '',
      'I would like to request a reservation with the following details:',
      '',
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone')}`,
      `Date: ${data.get('reservation-date')}`,
      `Time: ${data.get('reservation-time')}`,
      `Party size: ${data.get('party-size')}`,
      `Occasion: ${data.get('occasion') || 'Not specified'}`,
      `Seating preference: ${data.get('seating') || 'No preference'}`,
      `Dietary needs / allergies: ${data.get('dietary') || 'None provided'}`,
      `Additional notes: ${data.get('notes') || 'None provided'}`,
      '',
      'Please confirm whether this date and time are available.',
      '',
      'Thank you.'
    ].join('\n');

    if (status) status.textContent = 'Opening your email app with the reservation details…';
    window.location.href = `mailto:cuiarestaurant@info.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
