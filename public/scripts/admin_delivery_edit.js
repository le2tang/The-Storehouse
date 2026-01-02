// Search by name functionality
// Search by name functionality
const searchInput = document.getElementById('admin-order-search')

searchInput.addEventListener('input', function () {
  const query = this.value.toLowerCase().trim()
  const orderCards = document.querySelectorAll('.order-card')

  orderCards.forEach(card => {
    const orderName = card.getAttribute('data-name')

    if (orderName.includes(query)) {
      card.style.display = 'block'
    } else {
      card.style.display = 'none'
    }
  })
})

// Location Type Filter Functionality
document.querySelectorAll('.filter-badge').forEach(badge => {
  badge.addEventListener('click', function(e) {
    e.preventDefault()
    const location = this.getAttribute('data-filter')
    const orderCards = document.querySelectorAll('.order-card')
    
    orderCards.forEach(card => {
      const cardLocation = card.getAttribute('data-location')
      card.style.display = cardLocation === location ? 'block' : 'none'
    })
  })
})

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
