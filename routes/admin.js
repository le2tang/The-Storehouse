const express = require("express");
const crypto = require("crypto");
const { items_db, users_db } = require("../models/database.js");

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
})

module.exports = router;