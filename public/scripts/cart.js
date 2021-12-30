class Cart {
  constructor() {
    this.username = null;
    this.address = null;
    this.arrival = null;
    this.contact_method = null;
    this.contact_address = null;
    this.items = {};
  }

  addItem(id, quantity) {
    if (this.items[id]) {
      this.items[id] = this.items[id] + new Number(quantity);
    }
    else {
      this.items[id] = new Number(quantity);
    }
  }

  removeItem(id, quantity) {
    if (this.items[id]) {
      if (quantity) {
        this.items[id] = this.items[id] - new Number(quantity);
        if (this.items[id] < 1) {
          delete this.items[id];
        }
      }
      else {
        delete this.items[id];
      }
    }
  }

  isReady() {
    return (this.username != null) &&
      (this.contact_method != null) &&
      (this.contact_address != null) &&
      Object.values(this.items).length > 0;
  }

  isEmpty() {
    return Object.values(this.items).length == 0;
  }
}

let my_cart = new Cart();

function tryAddItem(id, itemname, max_quantity) {
  if (new Number(max_quantity) > 1) {
    addItemModal(id, itemname, max_quantity);
  }
  else {
    addItemToCart(id, itemname, 1);
  }
}

function addItemModal(id, itemname, max_quantity) {
  let modal = document.getElementById("add-to-cart-modal");
  let close_modal = document.getElementById("add-to-cart-close");
  let confirm_modal = document.getElementById("add-to-cart-confirm");

  document.getElementById("add-to-cart-itemname").innerHTML = itemname;
  document.getElementById("add-to-cart-quantity").value = 1;
  document.getElementById("add-to-cart-quantity").max = max_quantity;

  modal.style.display = "block";

  close_modal.onclick = () => {
    closeModal();
  }

  window.onclick = (event) => {
    if (event.target == modal) {
      closeModal();
    }
  }

  confirm_modal.onclick = () => {
    addItemToCart(id, itemname, document.getElementById("add-to-cart-quantity").value);
  }
}

function closeModal() {
  document.getElementById("add-to-cart-modal").style.display = "none";
}

function addItemToCart(id, itemname, quantity) {
  let cart_list = document.getElementById("cart-items-list");
  let list_item = document.getElementById(`item-card-${id}`);
  let list_item_quantity = list_item.getElementsByClassName("item-quantity")[0];

  let item_in_cart = my_cart.items[id];
  my_cart.addItem(id, quantity);

  if (item_in_cart) {
    let cart_item = document.getElementById(`cart-item-${id}`);
    cart_item.getElementsByClassName("cart-item-quantity")[0].innerHTML = my_cart.items[id];
  }
  else {
    let cart_item = document.createElement("li");  
    cart_item.classList.add("cart-item");
    cart_item.id = `cart-item-${id}`;
    
    let cart_item_contents = `
      <span class="cart-item-id" hidden>${id}</span>
      <span class="cart-item-itemname">${itemname}</span>
      <span>: </span>
      <span class="cart-item-quantity">${my_cart.items[id]}</span>
      <button class="cart-item-remove">&times;</button>`;
    
    cart_item.innerHTML = cart_item_contents;
    cart_list.append(cart_item);

    cart_item.getElementsByClassName("cart-item-remove")[0].onclick = (event) => {      
      my_cart.removeItem(id);
      
      event.target.parentElement.remove();

      list_item_quantity.innerHTML = new Number(list_item_quantity.innerHTML) + new Number(quantity);
      if (list_item_quantity.innerHTML > 0) {
        list_item.hidden = false;
      }

      document.getElementById("cart-empty-warning").hidden = !my_cart.isEmpty();
      document.getElementById("cart-submit").disabled = !my_cart.isReady();
    }
  }

  list_item_quantity.innerHTML -= quantity;
  if (list_item_quantity.innerHTML < 1) {
    list_item.hidden = true;
  }

  document.getElementById("cart-empty-warning").hidden = !my_cart.isEmpty();
  document.getElementById("cart-submit").disabled = !my_cart.isReady();
  
  closeModal();
}

function clearCart() {
  my_cart.items = {};

  let cart_list = document.getElementById("cart-items-list");
  while (cart_list.childElementCount > 0) {
    cart_list.firstChild.remove();
  }

  document.getElementById("cart-empty-warning").hidden = !my_cart.isEmpty();
  document.getElementById("cart-submit").disabled = !my_cart.isReady();
}

function cartSubmitSuccess(data) {
  alert("Cart has been submitted! Thanks");
  clearCart();
  return data;
}

function cartSubmitFail(err) {
  alert("Sorry, there was an error submitting your cart");
  console.log(err)
}

async function submitCart() {
  let res = await fetch("/marketplace/cart/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: my_cart.username,
      address: my_cart.address,
      arrival: my_cart.arrival,
      contact_method: my_cart.contact_method,
      contact_address: my_cart.contact_address,
      items: my_cart.items
    })
  })
  .then(res => res.json())
  .then(data => cartSubmitSuccess(data))
  .catch(err => cartSubmitFail(err));
}

function initializeCallbacks() {
  let cart_username = document.getElementById("cart-username");
  let cart_address = document.getElementById("cart-address");
  let cart_arrival = document.getElementById("cart-arrival");
  let cart_contact_method = document.getElementById("cart-contact-method");
  let cart_contact_address = document.getElementById("cart-contact-address");

  function validateInput(val) {
    if (val && val.length > 0) {
      return val;
    }
    else {
      return null;
    }
  }

  cart_username.onchange = () => {
    my_cart.username = validateInput(cart_username.value);
    document.getElementById("cart-submit").disabled = !my_cart.isReady();
  }
  cart_address.onchange = () => {
    my_cart.address = validateInput(cart_address.value);
    document.getElementById("cart-submit").disabled = !my_cart.isReady();
  }
  cart_arrival.onchange = () => {
    my_cart.arrival = validateInput(cart_arrival.value);
    document.getElementById("cart-submit").disabled = !my_cart.isReady();
  }
  cart_contact_method.onchange = () => {
    if (cart_contact_method.value == "fcb") {
      document.getElementById("cart-contact-address-label").innerHTML = "What is your name on Facebook?";
    }
    else if (cart_contact_method.value == "txt") {
      document.getElementById("cart-contact-address-label").innerHTML = "What is your number?";
    }
    else if (cart_contact_method.value == "eml") {
      document.getElementById("cart-contact-address-label").innerHTML = "What is your email address?";
    }
    
    my_cart.contact_method = validateInput(cart_contact_method.value);
    
    cart_contact_address.value = "";
    my_cart.contact_address = null;
    
    document.getElementById("cart-submit").disabled = !my_cart.isReady();
  }
  cart_contact_address.onchange = () => {
    my_cart.contact_method = validateInput(cart_contact_method.value);
    my_cart.contact_address = validateInput(cart_contact_address.value);
    document.getElementById("cart-submit").disabled = !my_cart.isReady();
  }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", initializeCallbacks);
}
else {
  initializeCallbacks();
}
