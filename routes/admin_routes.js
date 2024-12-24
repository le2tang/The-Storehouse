const app_config = require("../config/app_config.js")

const carts_model = require("../models/carts_model.js")
const items_model = require("../models/items_model.js")
const orders_model = require("../models/orders_model.js")
const users_model = require("../models/users_model.js")

const bcrypt = require("bcrypt")

const router = require("express").Router()

router.get(
  "/login",
  function (req, res) {
    if (!req.session.loggedin) {
      res.render("admin_login", { paths: app_config.paths })
    }
    else {
      res.redirect("/admin/carts")
    }
  }
)
router.post(
  "/login",
  async function (req, res, next) {
    const input_username = req.body.username
    username = input_username.replace(/\W/g, "")

    const input_password = req.body.password

    // fetch user profile from database
    try {
      const query_users = await users_model.getAdminPasswordHashByUsername(username)
      if (query_users.status == 400 && query_users.message == "USERNAME_NOT_FOUND") {
        return res.status(404).send("Username not found")
      }

      try {
        const result = await bcrypt.compare(input_password, query_users.result.password_hash)
        if (!result) {
          return res.status(400).send("Incorrect password")
        }

        req.session.loggedin = true;
        return res.redirect("/admin/carts")
      }
      catch (error) {
        return res.status(500).send(`bcrypt failed with error: ${error}`)
      }
    }
    catch (error) {
      return res.status(500).send(`Querying database for user failed with error: ${error}`)
    }
  }
)

router.get("/logout", function (req, res) {
  req.session.loggedin = false
  res.redirect("/marketplace")
})

router.get("/items", async function (req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }
  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    try {
      const result = await items_model.getAll()
      if (result.status != 200) {
        res.status(result.status).send(result.message)
      }

      items = result.result
      res.render(
        "admin_items",
        {
          paths: app_config.paths,
          items: items
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
})
router.post(
  "/items",
  async function (req, res) {
    if (!req.body) {
      return res.status(400).send({ message: "Invalid request" })
    }

    if (!req.session.loggedin) {
      return res.status(401).send({ message: "Unauthorized" })
    }
    else {
      if (!Array.isArray(req.body)) {
        items = new Array(req.body)
      } else {
        items = req.body
      }

      success_items = []
      failed_items = []
      for (item of items) {
        try {
          success_items.push(
            items_model.create(item)
          )
        } catch (error) {
          failed_items.push(item)
        }
      }

      if (failed_items.length > 0) {
        return res.status(500).send({ message: failed_items })
      }

      try {
        await success_items.all()
        res.redirect("/admin/items")
      } catch (error) {
        return res.status(500).send({ message: failed_items })
      }
    }
  }
)

router.get("/items/:uid", async function (req, res) {
  if (!req.body) {
    return res.status(400).send({ message: "Invalid request" })
  }
  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    const result = await items_model.getItemsByUids([req.params.uid])
    if (result.status != 200) {
      return res.send(result.status).send(result.message)
    }

    res.render(
      "admin_items_edit",
      {
        paths: app_config.paths,
        item: result.result[0]
      }
    )
  }
})
router.post("/items/:uid", async function (req, res) {
  if (!req.body) {
    return res.status(400).send({ message: "Invalid request" })
  }
  if (!req.session.loggedin) {
    return res.status(401).send({ message: "Unauthorized" })
  }

  req.body.tags = req.body.tags.toLowerCase().replace(", ", ",").split(",")
  items_model.updateItemByUid(req.body)

  res.redirect(`/admin/items/${req.params.uid}`)
})

router.get(
  "/carts",
  async function (req, res) {
    // Admin main page
    if (!req.body) {
      return res.status(400).send({ message: "Invalid request" })
    }
    if (!req.session.loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const carts = await carts_model.getAll()
      res.render(
        "admin_carts",
        {
          paths: app_config.paths,
          carts: carts,
          summary: carts_model.getSummary(carts)
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)
router.post(
  "/carts",
  async function (req, res) {
    // New cart submitted from the marketplace
    if (!req.body) {
      res.status(400).send({ message: "Invalid request" })
    }
    if (!req.session.loggedin || !req.session.user_id) {
      res.status(401).send("Session Expired: Please Login Again")
    }

    try {
      result = await orders_model.create(
        {
          user_id: req.session.user_id,
          items: req.body.items
        }
      )

      res.redirect("/marketplace")
    } catch (error) {
      return res.status(500).send({ message: `${error}` })
    }

    // const stock_items = await items_model.getItemsByUids(Object.keys(req.body.items))
    // var out_of_stock = []
    // stock_items.forEach((item) => {
    //   if (req.body.items[item.uid] > item.quantity) {
    //     out_of_stock.push(item)
    //   }
    // })

    // if (out_of_stock.length > 0) {
    //   out_of_stock_message = "Out of stock: "
    //   for (item of out_of_stock) {
    //     out_of_stock_message += `${item.itemname}(${item.description}), `
    //   }
    //   res.status(400).send({ message: out_of_stock_message })
    //   return
    // }

    // var carts = await carts_model.getCartsByUsername(req.body.username)
    // var index = 0
    // if (carts != null) {
    //   index = carts.length
    // }

    // req.body.index = index
    // await carts_model.create(req.body)

    // stock_items.forEach((item) => {
    //   items_model.decrementQuantityByUid(req.body.items[item.uid], item.uid)
    // })
  }
)

router.get("/carts/:username", async function (req, res) {
  if (!req.session.loggedin) {
    res.redirect("/admin/login")
  }
  else {
    var carts = await carts_model.getCartsByUsername(req.params.username)
    if (carts == null) {
      res.status(404).send({ message: `No carts for ${req.params.username} found` })
    }
    else {
      res.render("admin_carts_view", { paths: app_config.paths, carts: carts })
    }
  }
})
router.post("/carts/:username", async function (req, res) {
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
