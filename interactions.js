document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealTargets = [
    ['.about .cuiasphotos', 'reveal-left'],
    ['.about > div', 'reveal-right'],
    ['.lines', ''],
    ['.appetizers .menu_container', 'reveal-left'],
    ['.appetizers .photo_container', 'reveal-right'],
    ['.maincourse .menu_containertwo', 'reveal-right'],
    ['.maincourse .photo_container', 'reveal-left'],
    ['.desserts .menu_container', 'reveal-left'],
    ['.desserts .photo_container', 'reveal-right'],
    ['.drinkmenu .menu_containertwo', 'reveal-right'],
    ['.drinkmenu .photo_container', 'reveal-left'],
    ['.contact .map', 'reveal-left'],
    ['.contact .contact_container', 'reveal-right']
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
    }, { threshold: 0.14, rootMargin: '0px 0px -45px' });
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
