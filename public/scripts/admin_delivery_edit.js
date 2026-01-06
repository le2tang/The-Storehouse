document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  console.log(params.get('success')); // debug log

  if (params.get("success") === "updated") {
    alert("Delivery updated successfully!");
    // remove query param so refresh doesn't re-alert
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});



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

// Location Type filter functionality
const activeLocations = new Set()

document.querySelectorAll('.filter-badge').forEach(badge => {
  badge.addEventListener('click', function (e) {
    e.preventDefault()

    const location = this.getAttribute('data-filter')

    // Toggle active state
    if (activeLocations.has(location)) {
      activeLocations.delete(location)
      this.classList.remove('active')
    } else {
      activeLocations.add(location)
      this.classList.add('active')
    }

    applyLocationFilters()
  })
})

function applyLocationFilters() {
  const orderCards = document.querySelectorAll('.order-card')

  orderCards.forEach(card => {
    const cardLocation = card.getAttribute('data-location')

    // Show all if no filters selected
    if (activeLocations.size === 0) {
      card.style.display = 'block'
      return
    }

    card.style.display = activeLocations.has(cardLocation)
      ? 'block'
      : 'none'
  })
}

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
