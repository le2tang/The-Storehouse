const express = require("express");
const crypto = require("crypto");
const { items_db, carts_db } = require("../models/database.js");

const router = express.Router();

router.get("/",
  async (req, res) => {
    let carts = await carts_db.getAllCarts();
    res.render("admin", {
      items: [],
      cart_usernames: carts.map(cart => cart.username)
  });
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
      let existing_items = await items.getAllItems();
      let existing_item_names = existing_items.map(item => item.itemname);

      let items = JSON.parse(req.body.items);
      items.forEach((item, index) => {
        if (existing_item_names.includes(item.itemname)){
          let existing_item_index = existing_items.findIndex(exsiting_item => existing_item.itemname == item.itemname);

          if (item.description == existing_items[existing_item_index].description) {
            items_db.setItemQuantity(
              item.id,
              new Number(existing_items[existing_item_index].quantity) + new Number(item.quantity)
            );
          }
          else {
            items_db.addItem(
              item.id,
              item.itemname,
              new Number(item.quantity),
              item.description,
              item.tags
            );
          }
        }
        else {
          items_db.addItem(
            item.id,
            item.itemname,
            new Number(item.quantity),
            item.description,
            item.tags
          );
        }
      });
    }
    res.send(await items_db.getAllItems());
});

router.get("/carts/list",
  async (req, res) => {
    let carts = await carts_db.getAllCarts();
    let carts_details = await Promise.all(carts.map(
      async (cart) => {
        let items = await getCartItemsDetails(cart.items);
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

// router.get("/carts/download",
// async (req, res) => {
//   let datetime = new Date();

//   res.attachment('carts_list_' + datetime.getFullYear() + '_' + datetime.getMonth() + "_" + datetime.getDate() + '.json');
//   res.type('json');
//   res.send(JSON.stringify(await carts_db.getAllCarts(), null, 4));
// });

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