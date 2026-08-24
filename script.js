// Kinestrop Website Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Header scroll shadow
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.08)';
    } else {
      siteHeader.style.boxShadow = 'none';
    }
  });

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Smooth Active Nav Highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });

  // Lightbox Modal for Practice Gallery Photos
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lightbox.style.display = 'flex';
          lightboxImg.src = img.src;
          lightboxCaption.textContent = img.dataset.caption || img.alt || 'Kine Strop Praktijkfoto';
          document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
      });
    });

    const closeLightbox = () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
  }

  // Booking Info Modal Interactivity
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');

  const closeBookingModal = () => {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      bookingModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  // Intercept all booking buttons EXCEPT the confirmation button inside the modal itself
  const bookingLinks = document.querySelectorAll('a[href*="q-top.be"]:not(#confirmBookingBtn), .header-booking-btn, .mobile-nav-cta a, .trigger-booking-modal');
  bookingLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.id === 'confirmBookingBtn' || link.closest('#bookingModal')) return;
      // Allow normal open if user holds Ctrl/Cmd or right-clicks
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      openBooking();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookingModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeBookingModal);

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', () => {
      setTimeout(closeBookingModal, 100);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('active')) {
      closeBookingModal();
    }
  });

  // Floating Chat Widget Interactivity
  const chatWidgetBtn = document.getElementById('chatWidgetBtn');
  const chatWidgetDrawer = document.getElementById('chatWidgetDrawer');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatOpenBookingBtn = document.getElementById('chatOpenBookingBtn');
  const chatFaqBtn = document.getElementById('chatFaqBtn');

  if (chatWidgetBtn && chatWidgetDrawer) {
    const toggleChat = () => {
      const isActive = chatWidgetDrawer.classList.contains('active');
      if (isActive) {
        chatWidgetDrawer.classList.remove('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'true');
      } else {
        chatWidgetDrawer.classList.add('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'false');
      }
    };

    chatWidgetBtn.addEventListener('click', toggleChat);

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => {
        chatWidgetDrawer.classList.remove('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'true');
      });
    }

    if (chatOpenBookingBtn) {
      chatOpenBookingBtn.addEventListener('click', () => {
        chatWidgetDrawer.classList.remove('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'true');
        openBooking();
      });
    }

    if (chatFaqBtn) {
      chatFaqBtn.addEventListener('click', () => {
        chatWidgetDrawer.classList.remove('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'true');
      });
    }

    // Close chat drawer on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatWidgetDrawer.classList.contains('active')) {
        chatWidgetDrawer.classList.remove('active');
        chatWidgetDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  }
});

// Appointment Booking Helper Function
function openBooking(therapist) {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  } else {
    window.open('https://www.q-top.be/online-planner-v2/NL/?root=kq33633', '_blank', 'noopener,noreferrer');
  }
}

