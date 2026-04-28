
  // Active nav link
  const navLinks = document.querySelectorAll('.toc-nav a');
  const sections = document.querySelectorAll('section[id]');
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    // Scroll top button
    scrollTopBtn.classList.toggle('visible', scrollY > 400);

    // Active link
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });