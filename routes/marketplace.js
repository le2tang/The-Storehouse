const express = require("express");
const { items_db, carts_db } = require("../models/database.js");

const router = express.Router();

router.get("/",
  async (req, res) => {
    res.render("marketplace", { items: await items_db.getAllItems() });
});

router.post("/cart/submit",
  async (req, res) => {
    let reservation = await reserveItems(req.body.items);
    await carts_db.addCart(
      req.body.username,
      req.body.address,
      req.body.arrival,
      req.body.contact_method,
      req.body.contact_address,
      reservation.items
    );
    res.send(reservation.items);
});

async function reserveItems(cart_items) {
  let reserved_items = {};
  for (let ci in cart_items) {
    let item = await items_db.getItemById(ci);
    if (item.quantity > 0) {
      if (cart_items[ci] < item.quantity) {
        reserved_items[ci] = cart_items[ci];
  
        let new_item_quantity = item.quantity - cart_items[ci];
        await items_db.setItemQuantity(ci, new_item_quantity);
      }
      else {
        reserved_items[ci] = item.quantity;
        await items_db.setItemQuantity(ci, 0);
      }
    }
  }
  let num_items = Object.values(reserved_items).reduce((x, y) => x + y);

  let reservation = {
    num_items: num_items,
    items: reserved_items
  }

  return reservation;
}

module.exports = router;
