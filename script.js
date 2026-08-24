/* ==========================================================================
   Kinesitherapeuten Gent vzw — Interactive Portal Logic
   ========================================================================== */

// Sample verified data of physical therapists in Gent region
const therapistsData = [
  {
    id: 1,
    name: "Egon Declerck",
    practice: "Kine Strop",
    address: "Sint-Coletastraat 9, 9000 Gent",
    municipality: "Gent Centrum",
    phone: "0479 00 00 00",
    email: "info@kinestrop.be",
    homeVisit: true,
    specialties: ["Manuele therapie", "Chronische Pijn", "Pijneducatie", "Gedragsverandering"],
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "Mathias Van de Velde",
    practice: "Kine Strop",
    address: "Sint-Coletastraat 9, 9000 Gent",
    municipality: "Gent Centrum",
    phone: "0479 00 00 00",
    email: "mathias@kinestrop.be",
    homeVisit: true,
    specialties: ["Dry needling", "Manuele therapie", "Sportkinesitherapie", "Chronische Pijn"],
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "Eline Van den Bossche",
    practice: "Kinesitherapie Gent",
    address: "Franklin Rooseveltlaan 329, 9000 Gent",
    municipality: "Gent Zuid",
    phone: "0472 74 61 57",
    email: "eline@kinesitherapiegent.be",
    homeVisit: false,
    specialties: ["Bekkenbodem therapie", "Perinatale kinesitherapie", "Manuele therapie"],
    avatar: "https://images.unsplash.com/photo-1594824813566-88855d0a6886?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 4,
    name: "Alexia Braeckman",
    practice: "Kinesitherapie Gent",
    address: "Franklin Rooseveltlaan 329, 9000 Gent",
    municipality: "Gent Zuid",
    phone: "0472 74 61 57",
    email: "alexia@kinesitherapiegent.be",
    homeVisit: false,
    specialties: ["Algemene kinesitherapie", "Dry needling", "Postoperatieve revalidatie"],
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 5,
    name: "Sofie Claeys",
    practice: "Kine Papegaai",
    address: "Papegaaistraat 42, 9000 Gent",
    municipality: "Gent Coupure",
    phone: "09 223 11 22",
    email: "sofie@kine-gent.be",
    homeVisit: true,
    specialties: ["Ademhalingstherapie", "Pediatrische kinesitherapie", "Bobath therapie"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 6,
    name: "David De Smet",
    practice: "Groepspraktijk Kineplus",
    address: "Rijsenbergstraat 110, 9000 Gent",
    municipality: "Sint-Pieters",
    phone: "09 221 44 55",
    email: "info@kineplus.be",
    homeVisit: true,
    specialties: ["Sportkinesitherapie", "Oncorevalidatie", "Cardio-vasculaire kinesitherapie"],
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 7,
    name: "Charlotte Maes",
    practice: "Kine & Co Gent",
    address: "Antwerpsesteenweg 204, 9040 Sint-Amandsberg",
    municipality: "Sint-Amandsberg",
    phone: "09 238 99 00",
    email: "contact@kinenco.be",
    homeVisit: true,
    specialties: ["Geriatrische kinesitherapie", "Neurologische kinesitherapie", "Lymfedrainage"],
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 8,
    name: "Lukas Goethals",
    practice: "Crux Kinesitherapie",
    address: "Gordunakaai 18, 9000 Gent",
    municipality: "Gent Watersportbaan",
    phone: "0485 12 34 56",
    email: "lukas@cruxkine.be",
    homeVisit: false,
    specialties: ["Sportkinesitherapie", "Dry needling", "Vestibulaire kinesitherapie"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  }
];

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  const therapistContainer = document.getElementById('therapist-grid');
  const searchInput = document.getElementById('search-query');
  const municipalitySelect = document.getElementById('filter-municipality');
  const specialtySelect = document.getElementById('filter-specialty');
  const homeVisitCheckbox = document.getElementById('filter-home-visit');
  const resultCount = document.getElementById('result-count');

  // Render Therapists
  function renderTherapists(items) {
    if (!therapistContainer) return;

    if (items.length === 0) {
      therapistContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface-muted); border-radius: var(--radius-xl); border: 1px dashed var(--border-light);">
          <svg style="width: 48px; height: 48px; fill: var(--text-muted); margin-bottom: 1rem;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <h3 style="margin-bottom: 0.5rem; color: var(--navy-900);">Geen kinesitherapeuten gevonden</h3>
          <p style="color: var(--text-muted);">Probeer een andere zoekterm, gemeente of specialisatie te selecteren.</p>
        </div>
      `;
      if (resultCount) resultCount.textContent = '0 kinesitherapeuten';
      return;
    }

    if (resultCount) resultCount.textContent = `${items.length} kinesitherapeuten gevonden`;

    therapistContainer.innerHTML = items.map(item => `
      <div class="therapist-card">
        <div>
          <div class="therapist-header">
            <img src="${item.avatar}" alt="${item.name}" class="therapist-avatar">
            <div class="therapist-meta">
              <h3>${item.name}</h3>
              <div class="therapist-practice">
                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                ${item.practice}
              </div>
              <div class="therapist-location">
                <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                ${item.address} (${item.municipality})
              </div>
            </div>
          </div>
          <div class="therapist-tags">
            ${item.specialties.map(spec => `<span class="tag tag-highlight">${spec}</span>`).join('')}
          </div>
        </div>
        <div class="therapist-footer">
          <div class="home-visit-badge">
            ${item.homeVisit ? '<svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> Huisbezoeken mogelijk' : '<span style="color: var(--text-muted); font-size: 0.8rem;">Enkel op praktijk</span>'}
          </div>
          <button class="btn btn-sm btn-outline" onclick="openTherapistModal('${item.name}', '${item.practice}', '${item.address}', '${item.phone}', '${item.email}', '${item.specialties.join(', ')}')">Contacteer</button>
        </div>
      </div>
    `).join('');
  }

  // Filter Logic
  function filterTherapists() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const mun = municipalitySelect ? municipalitySelect.value : '';
    const spec = specialtySelect ? specialtySelect.value : '';
    const home = homeVisitCheckbox ? homeVisitCheckbox.checked : false;

    const filtered = therapistsData.filter(item => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.practice.toLowerCase().includes(q) || item.specialties.some(s => s.toLowerCase().includes(q));
      const matchesMun = !mun || item.municipality === mun;
      const matchesSpec = !spec || item.specialties.includes(spec);
      const matchesHome = !home || item.homeVisit === true;

      return matchesSearch && matchesMun && matchesSpec && matchesHome;
    });

    renderTherapists(filtered);
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', filterTherapists);
  if (municipalitySelect) municipalitySelect.addEventListener('change', filterTherapists);
  if (specialtySelect) specialtySelect.addEventListener('change', filterTherapists);
  if (homeVisitCheckbox) homeVisitCheckbox.addEventListener('change', filterTherapists);

  // Initial Render
  renderTherapists(therapistsData);
});

// Modal Logic
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Therapist Contact Modal Populator
function openTherapistModal(name, practice, address, phone, email, specialties) {
  const body = document.getElementById('contact-modal-body');
  if (body) {
    body.innerHTML = `
      <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--navy-900);">${name}</h3>
      <p style="color: var(--primary-700); font-weight: 600; margin-bottom: 1.25rem;">${practice}</p>
      <div style="background: var(--surface-muted); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <p style="margin-bottom: 0.5rem;"><strong>Adres:</strong> ${address}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Telefoon:</strong> <a href="tel:${phone}">${phone}</a></p>
        <p style="margin-bottom: 0.5rem;"><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Specialisaties:</strong> ${specialties}</p>
      </div>
      <a href="tel:${phone}" class="btn btn-primary" style="width: 100%;">Bellen voor Afspraak (${phone})</a>
    `;
    openModal('modal-contact');
  }
}

// Event Registration Popup
function openEventModal(eventTitle, eventDate, eventLocation) {
  const body = document.getElementById('event-modal-body');
  if (body) {
    body.innerHTML = `
      <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--navy-900);">${eventTitle}</h3>
      <p style="color: var(--primary-700); font-weight: 600; margin-bottom: 1.25rem;">📅 ${eventDate} | 📍 ${eventLocation}</p>
      <form onsubmit="event.preventDefault(); alert('Bedankt voor je inschrijving! Je ontvangt een bevestiging per e-mail.'); closeModal('modal-event');">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label>Naam en Voornaam</label>
          <input type="text" class="form-control" required placeholder="bv. Dr. Jan Peeters">
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label>E-mailadres</label>
          <input type="email" class="form-control" required placeholder="jan.peeters@kine.be">
        </div>
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label>RIZIV Nummer / Kine Praktijk (Optioneel)</label>
          <input type="text" class="form-control" placeholder="5-12345-67-000">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Inschrijving Bevestigen</button>
      </form>
    `;
    openModal('modal-event');
  }
}
