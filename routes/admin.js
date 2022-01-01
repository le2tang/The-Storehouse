const express = require("express");
const crypto = require("crypto");
const { items_db, users_db, carts_db } = require("../models/database.js");

const router = express.Router();

router.get("/",
  async (req, res) => {
    res.render("admin", { items: [] });
    // res.render("admin", { items: await items_db.getAllItems() });
});

// router.post("/items/add",
//   async (req, res) => {
//     await items_db.addItem(
//       crypto.randomBytes(8).toString("hex"),
//       req.body.itemname,
//       new Number(req.body.quantity),
//       req.body.description,
//       req.body.tags
//     );
//     res.redirect("/admin");
// });

// router.get("/items/edit/:id", (req, res) => {
//   let item = items_db.getItemById(req.params.id);
//   if (!item) {
//     res.status(404).send("Item not found");
//   }
//   else {
//     res.render("edit_item", { item: item });
//   }
// });

// router.post("/items/edit",
//   async (req, res) => {
//     await items_db.updateItem(
//       req.body.id,
//       req.body.itemname,
//       new Number(req.body.quantity),
//       req.body.description,
//       req.body.tags
//     );
//     res.redirect("/admin");
// })

// router.post("/items/edit/quantity/add",
//   async (req, res) => {
//     let item = items_db.getItemById(req.body.id);
//     if (!item) {
//       res.status(404).send("Item not found");
//     }
//     else {
//       await items_db.updateItem(
//         item.id,
//         item.itemname,
//         item.quantity + req.body["incr-quantity"],
//         item.description,
//         item.tags
//       );
//       res.redirect("/admin");
//     }
// });

// router.post("/items/edit/quantity/sub",
//   async (req, res) => {
//     let item = items_db.getItemById(req.body.id);
//     if (!item) {
//       res.status(404).send("Item not found");
//     }
//     else {
//       if (req.body["decr-quantity"] < item.quantity) {
//         await items_db.updateItem(
//           item.id,
//           item.itemname,
//           item.quantity - 1,
//           item.description,
//           item.tags
//         );
//       }
//       else {
//         await items_db.removeItemById(item.id);
//       }
//       res.redirect("/admin");
//     }
// });

// router.post("/items/remove",
//   async (req, res) => {
//     await items_db.removeItemById(req.body.id);
//     res.redirect("/admin");
// });

router.get("/items/list",
  async (req, res) => {
    res.send(JSON.stringify(await items_db.getAllItems(), null, 4));
});

router.get("/items/download",
  async (req, res) => {
    let datetime = new Date();

    res.attachment('items_list_' + datetime.getFullYear() + '_' + datetime.getMonth() + "_" + datetime.getDate() + '.json');
    res.type('json');
    res.send(JSON.stringify(await items_db.getAllItems(), null, 4));
});

router.post("/items/upload", 
  async (req, res) => {
    if (req.body.items) {
      let items = JSON.parse(req.body.items);
      items.forEach(i => {
        if (i.quantity > 0) {
          items_db.addItem(
            i.id,
            i.itemname,
            new Number(i.quantity),
            i.description,
            i.tags
          );
        }
      });
    }
    res.send(await items_db.getAllItems());
});

router.post("/carts",
  async (req, res) => {
    let cart = await carts_db.getCartByUsername(req.body.username);
    if (!cart) {
      res.status(404).send("Cart not found");
    }
    else {
      res.render("cart_details", {
        username: cart.username,
        address: cart.address,
        arrival: cart.arrival,
        contact_method: cart.contact_method,
        contact_address: cart.contact_address,
        items: await getCartItemsDetails(cart.items)
      });
    }
})

router.get("/carts/list",
  async (req, res) => {
    let carts = await carts_db.getAllCarts();
    let carts_details = await Promise.all(carts.map(
      async (cart) => {
        let items = await getCartItemsDetails(cart.items);
        console.log(cart, items);
        let cart_details = {
          username: cart.username,
          address: cart.address,
          arrival: cart.arrival,
          contact_method: cart.contact_method,
          contact_address: cart.contact_address,
          items: items
        };
        return cart_details;
    }));
    res.send(carts_details);
});

router.get("/carts/download",
async (req, res) => {
  let datetime = new Date();

  res.attachment('carts_list_' + datetime.getFullYear() + '_' + datetime.getMonth() + "_" + datetime.getDate() + '.json');
  res.type('json');
  res.send(JSON.stringify(await carts_db.getAllCarts(), null, 4));
});

async function getCartItemsDetails(item_ids) {
  let items = await Promise.all(Object.keys(item_ids).map(
    async (id) => {
      let item = await items_db.getItemById(id);
      item.quantity = item_ids[id];
      return item;
  }));
  return items;
}

module.exports = router;