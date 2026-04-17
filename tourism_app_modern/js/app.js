
document.addEventListener('DOMContentLoaded', () => {
  buildMap();
  bindUI();
  applyViewFilter({ query: '', filter: 'all' });
});
