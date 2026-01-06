// Alert messages for delivery actions
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search)

  const success = params.get('success')
  if (success === 'deleted') {
    alert('Delivery deleted successfully!')
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (success === 'completed') {
    alert('Delivery marked as completed!')
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (success === 'uncompleted') {
    alert('Delivery marked as uncompleted!')
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (success === 'updated') {
    alert('Delivery updated successfully!')
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})


