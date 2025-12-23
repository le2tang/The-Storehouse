const app_config = require("../config/app_config.js")

const items_model = require("../models/items_model.js")
const orders_model = require("../models/orders_model.js")
const users_model = require("../models/users_model.js")

const bcrypt = require("bcrypt")

const router = require("express").Router()

router.get(
  "/login",
  function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.render("admin_login", { paths: app_config.paths })
    }
    res.redirect("/admin/carts")
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

        req.session.admin_loggedin = true;
        return res.redirect("/admin/carts")
      }
      catch (error) {
        return res.status(500).send({ message: `bcrypt failed with error: ${error}` })
      }
    }
    catch (error) {
      return res.status(500).send({ message: `Querying database for user failed with error: ${error}` })
    }
  }
)

router.get("/logout", function (req, res) {
  req.session.admin_loggedin = false
  res.redirect("/")
})

router.get("/items", async function (req, res) {
  if (!req.session.admin_loggedin) {
    return res.redirect("/admin/login")
  }
  try {
    const result = await items_model.getAll()
    if (result.status != 200) {
      res.status(result.status).send({ message: result.message })
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
})
router.post(
  "/items",
  async function (req, res) {
    if (!req.body) {
      return res.status(400).send({ message: "Invalid request" })
    }

    if (!req.session.admin_loggedin) {
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
        await Promise.all(success_items)
        res.status(201).redirect("/admin/items")
      } catch (error) {
        return res.status(500).send({ message: error })
      }
    }
  }
)

router.get("/items/:uid", async function (req, res) {
  if (!req.session.admin_loggedin) {
    return res.redirect("/admin/login")
  }
  try {
    const result = await items_model.getItemsByUids([req.params.uid])
    if (result.status != 200) {
      return res.status(result.status).send({ message: result.message })
    }

    res.render(
      "admin_items_edit",
      {
        paths: app_config.paths,
        item: result.result[0]
      }
    )
  } catch (error) {
    res.status(500).send({ message: error })
  }
})
router.post("/items/:uid", async function (req, res) {
  if (!req.body) {
    return res.status(400).send({ message: "Invalid request" })
  }
  if (!req.session.admin_loggedin) {
    return res.status(401).send({ message: "Unauthorized" })
  }

  try {
    const result = await items_model.updateItemByUid(req.body)
    if (result.status != 200) {
      return res.status(result.status).send(result.message)
    }

    res.redirect("/admin/items")
  } catch (error) {
    res.status(500).send({ message: error })
  }
})

router.get(
  "/carts",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const result = await orders_model.getAllOrdersInfo()
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }

      carts = result.result
      res.render(
        "admin_carts",
        {
          paths: app_config.paths,
          carts: carts,
          summary: orders_model.getSummary(carts)
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
      return res.status(400).send({ message: "Invalid request" })
    }
    if ((!req.session.loggedin) || (!req.session.user_id)) {
      return res.status(401).send({ message: "Session Expired: Please Login Again" })
    }

    try {
      const result = await orders_model.create(
        {
          user_id: req.session.user_id,
          items: req.body
        }
      )
      if (result.status != 201) {
        return res.status(result.status).send({ message: result.message })
      }

      res.status(200).redirect("/marketplace")
    } catch (error) {
      return res.status(500).send({ message: `${error}` })
    }
  }
)

router.get(
  "/carts/:user_id",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const result = await orders_model.getOrdersByUserId(req.params.user_id)
      if (!result.status == 200) {
        return res.status(result.status).send({ message: result.message })
      }

      carts = result.result
      if (carts.length == 0) {
        return res.status(404).send({ message: `No carts for ${req.params.user_id} found` })

      }

      res.render(
        "admin_carts_view",
        {
          paths: app_config.paths,
          carts: carts
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)
router.post(
  "/carts/:user_id/:order_id",
  async function (req, res) {
    if (!req.body) {
      return res.status(400).send({ message: "Invalid request" })
    }
    if (!req.session.admin_loggedin) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    try {
      const updated_status = req.body.status
      if (updated_status == 3) {
        const result = await orders_model.removeOrderByOrderId(req.params.order_id)

        if (result.status != 200) {
          return res.status(result.status).send({ message: result.message })
        }
      }
      else {
        const result = await orders_model.updateStatusByOrderId(req.params.order_id, updated_status)

        if (result.status != 200) {
          return res.status(result.status).send({ message: result.message })
        }
      }

      res.redirect(`/admin/carts/${req.params.user_id}`)
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

router.post(
  "/user/password/reset",
  async function (req, res) {
    if (!req.body) {
      return res.status(400).send({ message: "Invalid request" })
    }
    if (!req.session.admin_loggedin) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    try {
      const num_salt_rounds = 10

      const salt = await bcrypt.genSalt(num_salt_rounds)
      const hash = await bcrypt.hash(req.body.password, salt)

      await users_model.updatePasswordHashByUserId(
        req.body.user_id, hash,
      ).then((result) => {
        if (result.status != 201) {
          return res.status(result.status).send(result.message)
        }

        return res.status(200).redirect(`/admin/carts/${req.params.user_id}`)
      }).catch((error) => {
        console.log(error)
        return res.status(500).send(`Writing to database failed with error ${error}`)
      })
    }
    catch (error) {
      console.log(error)
      return res.status(500).send(`bcrypt failed with error: ${error}`)
    }
  }
)

module.exports = router
