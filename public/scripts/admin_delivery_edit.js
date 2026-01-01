// update selected orders count on edit form
function updateSelectedCount() {
  const selected = document.querySelectorAll('input[name="order_ids"]:checked').length
  const el = document.getElementById('selected-count')
  if (el) el.textContent = selected
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('input[name="order_ids"]').forEach(cb => cb.addEventListener('change', updateSelectedCount))
  updateSelectedCount()
})
