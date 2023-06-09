const app_config = require("../config/app_config.js")
const carts_model = require("../models/carts_model.js")
const items_model = require("../models/items_model.js")
const users_model = require("../models/users_model.js")

const crypto = require("crypto")
var router = require("express").Router()

router.get("/", async function(req, res) {
  res.render("marketplace", { paths: app_config.paths, items: await items_model.getAll() })
})

router.get("/admin/login", function(req, res) {
  if (!req.session.loggedin) {
    res.render("login", { paths: app_config.paths })
  }
  else {
    res.redirect("/admin/carts")
  }
})
router.post("/admin/login", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  var user = await users_model.getUserByUsername(req.body.username)
  if (user == null) {
    res.send({ message: `User ${req.body.username} does not exist` })
  }
  else if (req.body.password != user.password) {
    res.send({ message: "Incorrect password" })
  }
  else {
    req.session.loggedin = true

    res.redirect("/admin/carts")
  }
})

router.get("/admin/logout", function(req, res) {
  req.session.loggedin = false
  res.redirect("/")
})

router.get("/admin/items", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    res.render("admin_items", { paths: app_config.paths, items: await items_model.getAll() })
  }
})
router.post("/admin/items", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  if (!req.session.loggedin) {
    res.status(401).send({ message: "Unauthorized" })
  }
  else {
    req.body.uid = crypto.randomBytes(8).toString("hex")
    req.body.tags = req.body.tags.toLowerCase().replace(", ", ",").split(",")
    items_model.create(req.body)

    res.redirect("/admin/items")
  }
})

router.get("/admin/items/:uid", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    var items = await items_model.getItemsByUids([req.params.uid])
    if (items == null) {
      res.status(404).send({ message: "Item not found" })
    }
    else {
      res.render("admin_items_edit", {
        paths: app_config.paths,
        item: items[0]
      })
    }
  }
})
router.post("/admin/items/:uid", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  if (!req.session.loggedin) {
    res.status(401).send({ message: "Unauthorized" })
  }
  else {
    req.body.tags = req.body.tags.toLowerCase().replace(", ", ",").split(",")
    items_model.updateItemByUid(req.body)

    res.redirect(`/admin/items/${req.params.uid}`)
  }
})

router.get("/admin/carts", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    var carts = await carts_model.getAll()
    carts = await Promise.all(carts.map(async function(cart) {
      cart.status = carts_model.status_msg[cart.status]
      
      var items_from_cart = await items_model.getItemsByUids(Object.keys(cart.items))
      items_from_cart = await Promise.all(items_from_cart.map(async function (item) {
        item.quantity = cart.items[item.uid]
        return item
      }))
      cart.items = items_from_cart
      
      return cart
    }))

    res.render("admin_carts", { paths: app_config.paths, carts: carts })
  }
})
router.post("/admin/carts", async function(req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }
  
  var carts = await carts_model.getCartsByUsername(req.body.username)
  var index = 0
  if (carts != null) {
    index = carts.length
  }

  req.body.index = index
  await carts_model.create(req.body)

  var items_from_cart = await items_model.getItemsByUids(Object.keys(req.body.items))
  items_from_cart.forEach(function(item) {
    item.quantity -= req.body.items[item.uid]
    items_model.updateItemByUid(item)
  })

  res.redirect("/")
})

router.get("/admin/carts/:username", async function(req, res) {
  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    var carts = await carts_model.getCartsByUsername(req.params.username)
    if (carts == null) {
      res.status(404).send({ message: `No carts for ${req.params.username} found` })
    }
    else {
      carts = await Promise.all(carts.map(async function(cart) {
        cart.status = carts_model.status_msg[cart.status]
        cart.contact_method = carts_model.contact_method_msg[cart.contact_method]

        var items_from_cart = await items_model.getItemsByUids(Object.keys(cart.items))
        items_from_cart = await Promise.all(items_from_cart.map(async function (item) {
          item.quantity = cart.items[item.uid]
          return item
        }))
        cart.items = items_from_cart

        return cart
      }))
      
      res.render("admin_carts_view", { paths: app_config.paths, carts: carts })
    }
  }  
})
router.post("/admin/carts/:username", async function(req, res) {  
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }
  
  if (!req.session.loggedin) {
    res.status(401).send({ message: "Unauthorized" })
  }
  else {
    carts_model.updateCartStatusByUsername(req.params.username, req.body.index, req.body.status)
    res.redirect(`/admin/carts/${req.params.username}`)
  }
})

module.exports = router