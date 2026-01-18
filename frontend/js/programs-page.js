// programs-page.js
// Renders the Programs page using data from ../data/programs.json
// Includes filtering and sorting functionality

let allPrograms = [];

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('programs-grid');
  if (!grid) return;

  grid.innerHTML = `
    <p class="status-message">Loading programs…</p>
  `;

  fetch('../data/programs.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((programs) => {
      if (!Array.isArray(programs) || programs.length === 0) {
        grid.innerHTML = `<p class="status-message">No programs found.</p>`;
        return;
      }

      allPrograms = programs;
      setupFilterListeners();
      applyFiltersAndSort();
    })
    .catch((err) => {
      console.error('Failed to load programs:', err);
      grid.innerHTML = `<p class="status-message error">Failed to load programs. Please refresh the page.</p>`;
    });
});

function setupFilterListeners() {
  const difficultyFilter = document.getElementById('difficultyFilter');
  const stipendFilter = document.getElementById('stipendFilter');
  const sortBy = document.getElementById('sortBy');
  const resetBtn = document.getElementById('resetFilters');

  if (difficultyFilter) difficultyFilter.addEventListener('change', applyFiltersAndSort);
  if (stipendFilter) stipendFilter.addEventListener('change', applyFiltersAndSort);
  if (sortBy) sortBy.addEventListener('change', applyFiltersAndSort);
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (difficultyFilter) difficultyFilter.value = '';
      if (stipendFilter) stipendFilter.value = '';
      if (sortBy) sortBy.value = 'name';
      applyFiltersAndSort();
    });
  }
}

function applyFiltersAndSort() {
  const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
  const stipendFilter = document.getElementById('stipendFilter')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'name';

  let filtered = [...allPrograms];

  if (difficultyFilter) {
    filtered = filtered.filter(p => 
      String(p?.difficulty || '').toLowerCase() === difficultyFilter.toLowerCase()
    );
  }

  if (stipendFilter === 'yes') {
    filtered = filtered.filter(p => {
      const stipend = String(p?.stipend || '').toLowerCase();
      return stipend !== 'n/a' && stipend !== 'certificates & perks';
    });
  } else if (stipendFilter === 'no') {
    filtered = filtered.filter(p => {
      const stipend = String(p?.stipend || '').toLowerCase();
      return stipend === 'n/a' || stipend === 'certificates & perks';
    });
  }

  if (sortBy === 'contributors') {
    filtered.sort((a, b) => (b?.contributors || 0) - (a?.contributors || 0));
  } else {
    filtered.sort((a, b) =>
      String(a?.name || '').localeCompare(String(b?.name || ''))
    );
  }

  renderPrograms(filtered);
}

function renderPrograms(programs) {
  const grid = document.getElementById('programs-grid');
  if (!grid) return;

  if (programs.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <p class="status-message">No programs match your filters. Try adjusting your selection.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = programs.map(renderProgramCard).join('');
}

function renderProgramCard(program) {
  const name = escapeHtml(program?.name || 'Open Source Program');
  const desc = escapeHtml(program?.description || 'No description provided.');
  const timeline = escapeHtml(program?.timeline || 'N/A');
  const difficulty = escapeHtml(program?.difficulty || 'Beginner');
  const stipend = escapeHtml(program?.stipend || 'N/A');
  const contributors = program?.contributors || 0;
  const organizations = program?.organizations || 0;
  const issues = program?.issues || 0;
  const skills = Array.isArray(program?.skills) ? program.skills : program?.contributions || [];
  const url = typeof program?.url === 'string' ? program.url.trim() : '';

  let diffColor = 'var(--primary-gold)';
  if (difficulty.toLowerCase().includes('intermediate')) diffColor = 'var(--secondary-gold)';
  if (difficulty.toLowerCase().includes('advanced')) diffColor = '#e74c3c';

  const skillsHtml = skills.length
    ? `<div class="card-skills">
         ${skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
       </div>`
    : '';

  const statsHtml = `
    <div class="card-stats">
      <span><i class="fas fa-users"></i> ${contributors} contributors</span>
      <span><i class="fas fa-building"></i> ${organizations} orgs</span>
      <span><i class="fas fa-exclamation-circle"></i> ${issues} issues</span>
    </div>
  `;

  return `
    <div class="program-card">
      <div class="card-accent" style="background: ${diffColor};"></div>
      <div class="card-content">
        <h4 class="card-title">${name}</h4>
        <p class="card-desc">${desc}</p>
        
        <div class="card-meta-grid">
          <div><i class="fas fa-calendar-alt"></i> <strong>Timeline:</strong> ${timeline}</div>
          <div><i class="fas fa-layer-group"></i> <strong>Level:</strong> <span style="color:${diffColor}; font-weight:600;">${difficulty}</span></div>
          <div><i class="fas fa-dollar-sign"></i> <strong>Stipend:</strong> ${stipend}</div>
        </div>

        ${skillsHtml}
        ${statsHtml}

        ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="card-link">
          Visit Official Website <i class="fas fa-arrow-up-right-from-square"></i>
        </a>` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
