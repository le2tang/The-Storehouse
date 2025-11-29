function initCallbacks() {
  const status_selector = document.getElementById("admin-summary-filter-status")
  const location_selector = document.getElementById("admin-summary-filter-location")
  status_selector.addEventListener("change", () => {
    filterCarts(status_selector.value, location_selector.value)
  })
  location_selector.addEventListener("change", () => {
    filterCarts(status_selector.value, location_selector.value)
  })
}

function filterCart(cart, status_filter, location_filter) {
  is_correct_status = (status_filter == "all") || (cart.getAttribute("status").toLowerCase() == status_filter)
  is_correct_location = (location_filter == "all") || (cart.getAttribute("address_type") == location_filter)

  if (is_correct_status && is_correct_location) {
    cart.style.display = ""
  }
  else {
    cart.style.display = "none"
  }
}


function filterCarts(status_filter, location_filter) {
  const carts_list = document.getElementById("admin-cart-list")
  const carts = [...carts_list.children]

  carts.forEach((cart) => filterCart(cart, status_filter, location_filter))

  // carts.forEach((cart) => {
  //   cart.style.display = "none"
  // })

  // if (status_filter == "pending" || status_filter == "all") {
  //   carts.forEach((cart) => {
  //     if (cart.getElementsByTagName("p")[0].className == "pending") {
  //       cart.style.display = ""
  //     }
  //   })
  // }
  // if (status_filter == "packed" || status_filter == "all") {
  //   carts.forEach((cart) => {
  //     if (cart.getElementsByTagName("p")[0].className == "packed") {
  //       cart.style.display = ""
  //     }
  //   })
  // }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks)
}
else {
  initCallbacks()
}