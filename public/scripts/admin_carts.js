function initCallbacks() {
  const selector = document.getElementById("admin-summary-filter")
  selector.addEventListener("change", () => {
    filterCarts(selector.value)
  })
}

function filterCarts(select_filter) {
  const carts_list = document.getElementById("admin-cart-list")
  const carts = [...carts_list.children]

  carts.forEach((cart) => {
    cart.style.display = "none"
  })

  if (select_filter == "pending" || select_filter == "all") {
    carts.forEach((cart) => {
      if (cart.getElementsByTagName("p")[0].className == "pending") {
        cart.style.display = ""
      }
    })
  }
  if (select_filter == "packed" || select_filter == "all") {
    carts.forEach((cart) => {
      if (cart.getElementsByTagName("p")[0].className == "packed") {
        cart.style.display = ""
      }
    })
  }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks)
}
else {
  initCallbacks()
}