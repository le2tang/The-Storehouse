

var items = {}

function isReady() {
  return Object.values(items).length > 0
}

function addItemModal(uid, itemname, max_quantity) {
  var modal_background = document.getElementById("add-to-cart-background")
  var close_modal = document.getElementById("add-to-cart-close")
  var confirm_modal = document.getElementById("add-to-cart-confirm")

  document.getElementById("add-to-cart-itemname").innerHTML = itemname
  document.getElementById("add-to-cart-quantity").value = 1
  document.getElementById("add-to-cart-quantity").max = max_quantity
  document.getElementById("add-to-cart-quantity").min = 1

  modal_background.style.display = "block";

  close_modal.onclick = () => {
    modal_background.style.display = "none"
  }

  window.onclick = (event) => {
    if (event.target == modal_background) {
      modal_background.style.display = "none"
    }
  }

  confirm_modal.onclick = () => {
    var desired_quantity = document.getElementById("add-to-cart-quantity").value
    if (desired_quantity < 1) {
      desired_quantity = 1
      alert("The item quantity cannot be less than 1")
    } else if (desired_quantity > max_quantity) {
      desired_quantity = max_quantity
      alert(`The item quantity cannot be more than ${max_quantity}`)
    }
    addItemToCart(uid, itemname, desired_quantity)
  }
}

function addItemToCart(uid, itemname, desired_quantity) {
  desired_quantity = Number(desired_quantity)
  if (uid in items) {
    items[uid] += desired_quantity

    var cart_item = document.getElementById(`cart-item-${uid}`)
    cart_item.getElementsByClassName("cart-item-quantity")[0].innerHTML = items[uid]
  }
  else {
    items[uid] = desired_quantity

    var cart_item = document.createElement("div")
    cart_item.classList.add("cart-item")
    cart_item.id = `cart-item-${uid}`

    var cart_item_contents = `
      <span class="cart-item-uid" hidden>${uid}</span>
      <span class="cart-item-quantity">${items[uid]}</span>
      <span class="cart-item-itemname">${itemname}</span>
      <button class="cart-item-remove">&times;</button>`
    cart_item.innerHTML = cart_item_contents
    document.getElementById("marketplace-cart-list").append(cart_item)

    cart_item.getElementsByClassName("cart-item-remove")[0].onclick = (event) => {
      event.target.parentElement.remove()

      var stock_item = document.getElementById(`item-card-${uid}`)
      var stock_item_quantity = stock_item.getElementsByClassName("item-card-quantity")[0]
      const new_stock_quantity = Number(stock_item_quantity.innerHTML) + items[uid]
      stock_item_quantity.innerHTML = new_stock_quantity
      if (new_stock_quantity > 0) {
        stock_item.style.display = ""
      }

      delete items[uid]

      document.getElementById("cart-submit").disabled = !isReady()
    }
  }

  document.getElementById("cart-empty-warning").hidden = Object.keys(items).length > 0

  var stock_item = document.getElementById(`item-card-${uid}`)
  var stock_item_quantity = stock_item.getElementsByClassName("item-card-quantity")[0]
  const new_stock_quantity = Number(stock_item_quantity.innerHTML) - Number(desired_quantity)
  stock_item_quantity.innerHTML = new_stock_quantity
  if (new_stock_quantity < 1) {
    stock_item.style.display = "none"
  }

  document.getElementById("add-to-cart-background").style.display = "none"

  document.getElementById("cart-submit").disabled = !isReady()
}

function tryAddItem(uid, itemname) {
  const item = document.getElementById(`item-card-${uid}`)
  const item_quantity = item.getElementsByClassName("item-card-quantity")[0]
  const max_quantity = Number(item_quantity.innerHTML)
  if (max_quantity > 1) {
    addItemModal(uid, itemname, max_quantity);
  }
  else {
    addItemToCart(uid, itemname, 1);
  }
}

function clearCart() {
  items = {}

  let cart_list = document.getElementById("marketplace-cart-list");
  while (cart_list.childElementCount > 0) {
    cart_list.firstChild.remove();
  }

  document.getElementById("cart-empty-warning").hidden = false;
  document.getElementById("cart-submit").disabled = true;
}

function cartSubmit() {
  alert("Your reservation has been submitted! Thanks");
  clearCart();
}

function cartSubmitFail(response) {
  response.json().then((json) => {
    alert(`Sorry, there was an error submitting your cart:\n\n${json.message}`);
  })
}

async function submitCart() {
  if (!isReady()) {
    alert(`Sorry, you cannot submit an empty cart`)
  }
  else {
    await fetch(
      "/admin/carts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items)
      }
    )
      .then(
        (response) => {
          if (response.ok) {
            cartSubmit()
          }
          else {
            cartSubmitFail(response)
          }
        }
      )
      .catch(
        (response) => {
          cartSubmitFail(response)
        }
      );
  }
}

function initCallbacks() {
  const search_bar = document.getElementById("marketplace-item-search")
  search_bar.addEventListener(
    "input",
    () => {
      const search_pattern = search_bar.value.toLowerCase()

      const items_list = document.getElementById("marketplace-item-list")
      const items = [...items_list.getElementsByClassName("item-card")]

      var num_matches = 0
      items.forEach((item) => {
        const itemname = item.getElementsByClassName("item-card-itemname")[0].innerHTML.toLowerCase()
        if (itemname.startsWith(search_pattern)) {
          item.style.display = ""
          ++num_matches
        }
        else {
          item.style.display = "none"
        }
      })

      const search_empty = document.getElementById("marketplace-search-empty")
      if (num_matches > 0) {
        search_empty.hidden = true
      }
      else {
        search_empty.hidden = false
      }
    }
  )
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks);
}
else {
  initCallbacks();
}
