var cart = {
  username: null,
  address: null,
  arrival: null,
  contact_method: null,
  contact_address: null,
  items: {},
  status: 0,

  isReady() {
    return (this.username != null) &&
           (this.contact_method != null) &&
           (this.contact_address != null) &&
           Object.values(this.items).length > 0
  }
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
    desired_quantity = document.getElementById("add-to-cart-quantity").value
    addItemToCart(uid, itemname, desired_quantity)
  }
}

function addItemToCart(uid, itemname, desired_quantity) {
  desired_quantity = Number(desired_quantity)
  if (uid in cart.items) {
    cart.items[uid] += desired_quantity

    var cart_item = document.getElementById(`cart-item-${uid}`)
    cart_item.getElementsByClassName("cart-item-quantity")[0].innerHTML = cart.items[uid]
  }
  else {
    cart.items[uid] = desired_quantity

    var cart_item = document.createElement("div")  
    cart_item.classList.add("cart-item")
    cart_item.id = `cart-item-${uid}`
    
    var cart_item_contents = `
      <span class="cart-item-uid" hidden>${uid}</span>
      <span class="cart-item-quantity">${cart.items[uid]}</span>
      <span class="cart-item-itemname">${itemname}</span>
      <button class="cart-item-remove">&times;</button>`
    cart_item.innerHTML = cart_item_contents
    document.getElementById("marketplace-cart-list").append(cart_item)

    cart_item.getElementsByClassName("cart-item-remove")[0].onclick = (event) => {           
      event.target.parentElement.remove()

      var stock_item = document.getElementById(`item-card-${uid}`)
      var stock_item_quantity = stock_item.getElementsByClassName("item-card-quantity")[0]
      stock_item_quantity.innerHTML = Number(stock_item_quantity.innerHTML) + cart.items[uid]

      delete cart.items[uid]
    }
  }

  document.getElementById("cart-empty-warning").hidden = Object.keys(cart.items).length > 0

  var stock_item = document.getElementById(`item-card-${uid}`)
  var stock_item_quantity = stock_item.getElementsByClassName("item-card-quantity")[0]
  stock_item_quantity.innerHTML = Number(stock_item_quantity.innerHTML) - Number(desired_quantity)
  stock_item.hidden = stock_item_quantity.value > 0

  document.getElementById("add-to-cart-background").style.display = "none"
}

function tryAddItem(uid, itemname, max_quantity) {
  if (max_quantity > 1) {
    addItemModal(uid, itemname, max_quantity);
  }
  else {
    addItemToCart(uid, itemname, 1);
  }
}

function clearCart() {
  cart.items = {}

  let cart_list = document.getElementById("marketplace-cart-list");
  while (cart_list.childElementCount > 0) {
    cart_list.firstChild.remove();
  }

  document.getElementById("cart-empty-warning").hidden = false;
  document.getElementById("cart-submit").disabled = true;
}

function cartSubmitSuccess(data) {
  alert("Your reservation has been submitted! Thanks");
  clearCart();
}

function cartSubmitFail(err) {
  alert("Sorry, there was an error submitting your cart");
  console.log(err)
}

async function submitCart() {
  if (!cart.isReady()) {
    return
  }

  await fetch("/admin/carts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cart)
  })
  .then(data => cartSubmitSuccess(data))
  .catch(err => cartSubmitFail(err));
}

function initCallbacks() {
  var cart_contact_username = document.getElementById("cart-contact-username")
  var cart_contact_address = document.getElementById("cart-contact-address")
  var cart_contact_arrival = document.getElementById("cart-contact-arrival")
  var cart_contact_method = document.getElementById("cart-contact-method-select")
  var cart_contact_profile = document.getElementById("cart-contact-profile")

  function validateInput(val) {
    if (val && val.length > 0) {
      return val;
    }
    else {
      return null;
    }
  }

  cart_contact_username.oninput = () => {
    cart.username = validateInput(cart_contact_username.value);
    document.getElementById("cart-submit").disabled = !cart.isReady(cart);
  }
  cart_contact_address.oninput = () => {
    cart.address = validateInput(cart_contact_address.value);
    document.getElementById("cart-submit").disabled = !cart.isReady();
  }
  cart_contact_arrival.oninput = () => {
    cart.arrival = validateInput(cart_contact_arrival.value);
    document.getElementById("cart-submit").disabled = !cart.isReady();
  }
  cart_contact_method.oninput = () => {
    if (cart_contact_method.value == "fcb") {
      cart_contact_profile.placeholder = "Facebook Profile Name"
    }
    else if (cart_contact_method.value == "wha") {
      cart_contact_profile.placeholder = "Phone Number"
    }
    else if (cart_contact_method.value == "txt") {
      cart_contact_profile.placeholder = "Text Number"
    }
    else if (cart_contact_method.value == "eml") {
      cart_contact_profile.placeholder = "Email Address"
    }

    cart.contact_method = validateInput(cart_contact_method.value);
    
    cart_contact_address.value = "";
    cart.contact_address = null;

    document.getElementById("cart-submit").disabled = !cart.isReady();
  }
  cart_contact_profile.oninput = () => {
    cart.contact_method = validateInput(cart_contact_method.value)
    cart.contact_address = validateInput(cart_contact_profile.value)
    document.getElementById("cart-submit").disabled = !cart.isReady();
  }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initCallbacks);
}
else {
  initCallbacks();
}
