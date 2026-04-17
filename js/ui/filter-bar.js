import { FILTERS } from '../constants.js';

export function renderFilterChips(container, activeFilterId, onChange) {
  container.innerHTML = '';

  FILTERS.forEach((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `chip${filter.id === activeFilterId ? ' is-active' : ''}`;
    button.textContent = filter.label;
    button.addEventListener('click', () => onChange(filter.id));
    container.appendChild(button);
  });
}
