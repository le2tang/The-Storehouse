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

// Update selected orders count
function updateSelectedCount() {
  const selectedOrders = document.querySelectorAll('input[name="order_ids"]:checked').length
  document.getElementById('selected-count').textContent = selectedOrders
}

document.querySelectorAll('input[name="order_ids"]').forEach(checkbox => {
  checkbox.addEventListener('change', updateSelectedCount)
})

// Form validation
document.getElementById('new-delivery-form').addEventListener('submit', function(e) {
  const description = document.getElementById('description').value.trim()
  const long_desc = document.getElementById('long_desc') ? document.getElementById('long_desc').value.trim() : ''
  const date = document.getElementById('date').value
  const time = document.getElementById('time').value
  const selectedOrders = document.querySelectorAll('input[name="order_ids"]:checked')

  if (!description) {
    e.preventDefault()
    alert('Please enter a description')
    return
  }

  if (description.length > 20) {
    e.preventDefault()
    alert('Description must be 20 characters or fewer')
    return
  }

  if (long_desc && long_desc.length > 300) {
    e.preventDefault()
    alert('Long description must be 300 characters or fewer')
    return
  }

  if (!date) {
    e.preventDefault()
    alert('Please select a delivery date')
    return
  }

  if (!time) {
    e.preventDefault()
    alert('Please select a delivery time')
    return
  }

  if (selectedOrders.length === 0) {
    e.preventDefault()
    alert('Please select at least one order')
    return
  }
})

// Set today as minimum date
const dateInput = document.getElementById('date')
const today = new Date().toISOString().split('T')[0]
dateInput.min = today
