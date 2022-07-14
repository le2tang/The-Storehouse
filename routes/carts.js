const express = require("express");
const { items_db, carts_db } = require("../models/database.js");

router = express.Router();

router.post("/details",
  async (req, res) => {
    let carts = await carts_db.getAllCartsByUsername(req.body.username);
    if (!carts) {
      res.status(404).send("Cart not found");
    }
    else {
      res.render("cart_details", {
        carts: await Promise.all(carts.map(
          async (cart) => {
            console.log(req.body.admin, cart.address);
            return {
              admin: req.body.admin,
              username: cart.username,
              address: (req.body.admin ? cart.address : null),
              items: await getCartItemsDetails(cart.items)
            };
        }))
      });
    }
});

async function getCartItemsDetails(item_ids) {
  let items = await Promise.all(Object.keys(item_ids).map(
    async (id) => {
      let item = await items_db.getItemById(id);
      if (!item) {
        item = {
          id: id,
          itemname: id,
          quantity: 0,
          description: "Unknown item",
          tags: []
        }
      }
      else {
        item.quantity = item_ids[id];
      }
      return item;
  }));
  return items;
}

module.exports = router;