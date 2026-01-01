export function initializeDeliveriesCalendar(deliveries) {
  let currentDate = new Date()
  let currentView = 'month'

  const calendarContainer = document.getElementById('calendar')
  const calendarGrid = document.getElementById('calendar-grid')

  // Function to render calendar based on view
  function renderCalendar() {
    calendarGrid.innerHTML = ''
    
    switch (currentView) {
      case 'day':
        renderDayView()
        break
      case 'week':
        renderWeekView()
        break
      case 'month':
        renderMonthView()
        break
    }
  }

  // Render Day View
  function renderDayView() {
    const day = new Date(currentDate)
    const dateStr = day.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const isToday = day.toDateString() === new Date().toDateString()
    document.getElementById('current-date').textContent = dateStr

    const dayDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.date)
      return deliveryDate.toDateString() === day.toDateString()
    })

    let html = `<div class="day-view ${isToday ? 'today' : ''}"><h3>${dateStr} ${isToday ? '<span class="today-badge">Today</span>' : ''}</h3><div class="deliveries-container">`
    
    if (dayDeliveries.length === 0) {
      html += '<p class="no-deliveries">No deliveries scheduled</p>'
    } else {
        dayDeliveries.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'Delivered' ? 1 : -1
        }
        return new Date(a.date) - new Date(b.date)
        })
      dayDeliveries.forEach(delivery => {
        html += createDeliveryCard(delivery)
      })
    }
    
    html += '</div></div>'
    calendarGrid.innerHTML = html
    addDeliveryClickHandlers()
  }

  // Render Week View
  function renderWeekView() {
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const dateStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
                    ' - ' + 
                    weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    document.getElementById('current-date').textContent = dateStr

    let html = '<div class="week-view"><div class="week-grid">'

    // Each day is a single column with header above the cell
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNum = day.getDate()
      const isToday = day.toDateString() === new Date().toDateString()
      const isSelected = day.toDateString() === currentDate.toDateString()

      const dayDeliveries = deliveries.filter(d => {
        const deliveryDate = new Date(d.date)
        return deliveryDate.toDateString() === day.toDateString()
      })

      html += `<div class="day-column ${isToday ? 'today-column' : ''} ${isSelected ? 'selected-column' : ''}">`
      html += `<div class="day-header"><span class="day-name">${dayName}</span><span class="day-num">${dayNum}</span></div>`
      html += `<div class="day-cell">`

      if (dayDeliveries.length > 0) {
        dayDeliveries.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'Delivered' ? 1 : -1
        }
        return new Date(a.date) - new Date(b.date)
        })
        dayDeliveries.forEach(delivery => {
          // format time from delivery.date (timestamp)
          const dt = new Date(delivery.date)
          const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const title = escapeHtml(delivery.description || '')
          console.log('Rendering delivery:', delivery)
          // single-line: time + description
          html += `<div class="${delivery.status === 'Delivered' ? 'delivery-badge-complete' : 'delivery-badge'} single-line" data-id="${delivery.delivery_id}" style="background-color: ${getStatusColor(delivery.status)};">
                    <span class="delivery-time">${timeStr}</span>
                    <span class="delivery-desc">${title}</span>
                    
                   </div>`
        })
      }

      html += `</div></div>`
    }

    html += '</div></div>'
    calendarGrid.innerHTML = html
    addDeliveryClickHandlers()
  }

  // Render Month View
  function renderMonthView() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    document.getElementById('current-date').textContent = monthName

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    let html = '<div class="month-view"><table class="month-table"><tr>'
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    dayNames.forEach(day => {
      html += `<th>${day}</th>`
    })
    html += '</tr><tr>'

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      html += '<td class="empty"></td>'
    }

    // Days of month
    let dayCounter = firstDay
    for (let day = 1; day <= daysInMonth; day++) {
      if (dayCounter % 7 === 0 && dayCounter !== 0) {
        html += '</tr><tr>'
      }

      const currentDay = new Date(year, month, day)
      const dayDeliveries = deliveries.filter(d => {
        const deliveryDate = new Date(d.date)
        return deliveryDate.toDateString() === currentDay.toDateString()
      })
      const isToday = currentDay.toDateString() === new Date().toDateString()

      html += `<td class="month-day ${dayDeliveries.length > 0 ? 'has-deliveries' : ''} ${isToday ? 'today' : ''}"><span class="day-number">${day}</span>`
      
      if (dayDeliveries.length > 0) {
        dayDeliveries.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'Delivered' ? 1 : -1
        }
        return new Date(a.date) - new Date(b.date)
        })
        html += '<div class="day-deliveries">'
        dayDeliveries.slice(0, 2).forEach(delivery => {
          const dt = new Date(delivery.date)
          const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const title = escapeHtml((delivery.description || '').slice(0, 40))
          html += `<div class="${delivery.status === 'Delivered' ? 'mini-delivery-complete' : 'mini-delivery'} single-line" data-id="${delivery.delivery_id}" title="${escapeHtml(delivery.description)}">
                    <span class="mini-time">${timeStr}</span>
                    <span class="mini-desc">${title}</span>
                   </div>`
        })
        if (dayDeliveries.length > 2) {
        const hidden = dayDeliveries.slice(2)

        const statusCounts = hidden.reduce((acc, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1
            return acc
        }, {})

        const badgeText = Object.entries(statusCounts)
            .map(([status, count]) => `${count} ${status}`)
            .join(', ')

        html += `<div class="more-badge">+${badgeText}</div>`
        }

        html += '</div>'
      }
      
      html += '</td>'
      dayCounter++
    }

    // Empty cells for days after month ends
    while (dayCounter % 7 !== 0) {
      html += '<td class="empty"></td>'
      dayCounter++
    }

    html += '</tr></table></div>'
    calendarGrid.innerHTML = html
    addDeliveryClickHandlers()
  }

  // Helper function to create delivery card
  function createDeliveryCard(delivery) {
    const dt = new Date(delivery.date)
    const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `
      <div class="delivery-card" data-id="${delivery.delivery_id}">
        <strong>${delivery.description}</strong>
        <p>Status: <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span></p>
        <p class="delivery-time">Time: ${timeStr}</p>
      </div>
    `
  }

  // escape HTML to prevent injection into the calendar
  function escapeHtml(unsafe) {
    if (!unsafe && unsafe !== 0) return ''
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // Helper function to get status color
  function getStatusColor(status) {
    // Normalize status to handle strings (any case) and numeric codes
    const s = String(status).toLowerCase()
    const colors = {
      'pending': '#fff3cd',
      'packed': '#cfe2ff',
      'arranged': '#d1ecf1',
      'delivered': '#d1e7dd'
    }

    // Some codepaths may send numeric status codes (e.g. 3 = delivered)
    if (s === '3') return colors['delivered']

    return colors[s] || '#f0f0f0'
  }

  // Add click handlers to delivery elements
  function addDeliveryClickHandlers() {
    document.querySelectorAll('[data-id]').forEach(element => {
      element.addEventListener('click', async function(e) {
        e.stopPropagation()
        const deliveryId = this.getAttribute('data-id')
        // Navigate to delivery detail page
        window.location.href = `/admin/deliveries/${deliveryId}`
      })
    })
  }

  // Event listeners
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'))
      this.classList.add('active')
      currentView = this.getAttribute('data-view')
      renderCalendar()
    })
  })

  document.getElementById('prev-btn').addEventListener('click', function() {
    if (currentView === 'day') {
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() - 7)
    } else {
      currentDate.setMonth(currentDate.getMonth() - 1)
    }
    renderCalendar()
  })

  document.getElementById('next-btn').addEventListener('click', function() {
    if (currentView === 'day') {
      currentDate.setDate(currentDate.getDate() + 1)
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() + 7)
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    renderCalendar()
  })

  document.getElementById('today-btn').addEventListener('click', function() {
    currentDate = new Date()
    renderCalendar()
  })

  // Initial render
  renderCalendar()
}

