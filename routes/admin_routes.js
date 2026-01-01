const app_config = require("../config/app_config.js")

const items_model = require("../models/items_model.js")
const orders_model = require("../models/orders_model.js")
const users_model = require("../models/users_model.js")
const deliveries_model = require("../models/deliveries_model.js")

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

router.get(
  "/deliveries",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const result = await deliveries_model.getAll()
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }

      deliveries = result.result

      let pendingDeliveriesCount = deliveries.filter(d => d.status === 'Pending' || d.status === '0').length
      let deliveredDeliveriesCount = deliveries.filter(d => d.status === 'Delivered' || d.status === '3').length
      res.render(
        "admin_deliveries",
        {
          paths: app_config.paths,
          deliveries: deliveries,
          pendingDeliveriesCount,
          deliveredDeliveriesCount
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

router.get(
  "/deliveries/:delivery_id",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const result = await deliveries_model.getDeliveryByDeliveryId(req.params.delivery_id)
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }

      delivery = result.result
      res.render(
        "admin_delivery_details",
        {
          paths: app_config.paths,
          delivery: delivery
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

// JSON endpoint for delivery details (used by calendar UI)
router.get(
  "/deliveries/:delivery_id/json",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    try {
      const result = await deliveries_model.getDeliveryByDeliveryId(req.params.delivery_id)
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }

      return res.status(200).json({ result: result.result })
    } catch (error) {
      return res.status(500).send({ message: error })
    }
  }
)

// Edit delivery form
router.get(
  "/deliveries/:delivery_id/edit",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const dRes = await deliveries_model.getDeliveryByDeliveryId(req.params.delivery_id)
      if (dRes.status != 200) {
        return res.status(dRes.status).send({ message: dRes.message })
      }

      // fetch available orders (status=1) to allow adding
      const ordersRes = await orders_model.getAllOrdersInfo()
      const availableOrders = ordersRes.status == 200 ? ordersRes.result : []

      res.render("admin_delivery_edit", { paths: app_config.paths, delivery: dRes.result, availableOrders })
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

// Submit delivery edits
router.post(
  "/deliveries/:delivery_id/edit",
  async function (req, res) {
    if (!req.session.admin_loggedin) return res.redirect("/admin/login")

    const { description, long_desc, date, time, order_ids } = req.body
    if (!description || !date || !time) {
      return res.redirect(`/admin/deliveries/${req.params.delivery_id}/edit?error=missing_fields`)
    }

    const orderIds = order_ids ? (Array.isArray(order_ids) ? order_ids : [order_ids]) : []

    try {
      function combineDateAndTime(dateStr, timeStr) {
        const [y, m, d] = dateStr.split('-').map(Number)
        const [hh, mm] = timeStr.split(':').map(Number)
        const dt = new Date(y, m - 1, d, hh || 0, mm || 0, 0)
        const pad = n => String(n).padStart(2, '0')
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
      }

      const datetime = combineDateAndTime(date, time)

      const upd = await deliveries_model.update({
        delivery_id: req.params.delivery_id,
        description,
        long_desc: long_desc || null,
        date: datetime,
        status: 0,
        order_ids: orderIds
      })

      if (upd.status !== 200) {
        return res.redirect(`/admin/deliveries/${req.params.delivery_id}/edit?error=update_failed`)
      }

      res.redirect(`/admin/deliveries/${req.params.delivery_id}`)
    } catch (error) {
      console.error(error)
      res.redirect(`/admin/deliveries/${req.params.delivery_id}/edit?error=update_failed`)
    }
  }
)

// Delete delivery
router.post(
  "/deliveries/:delivery_id/delete",
  async function (req, res) {
    if (!req.session.admin_loggedin) return res.redirect("/admin/login")
    try {
      const del = await deliveries_model.deleteDelivery(req.params.delivery_id)
      if (del.status !== 200) {
        return res.redirect(`/admin/deliveries/${req.params.delivery_id}?error=delete_failed`)
      }
      res.redirect('/admin/deliveries')
    } catch (error) {
      console.error(error)
      res.redirect(`/admin/deliveries/${req.params.delivery_id}?error=delete_failed`)
    }
  }
)

// Mark as completed
router.post(
  "/deliveries/:delivery_id/mark-complete",
  async function (req, res) {
    if (!req.session.admin_loggedin) return res.redirect("/admin/login")
    try {
      const m = await deliveries_model.markComplete(req.params.delivery_id)
      if (m.status !== 200) {
        return res.redirect(`/admin/deliveries/${req.params.delivery_id}?error=mark_failed`)
      }
      res.redirect(`/admin/deliveries/${req.params.delivery_id}`)
    } catch (error) {
      console.error(error)
      res.redirect(`/admin/deliveries/${req.params.delivery_id}?error=mark_failed`)
    }
  }
)

router.get(
  "/new-delivery",
  async function (req, res) {
    if (!req.session.admin_loggedin) {
      return res.redirect("/admin/login")
    }

    try {
      const result = await orders_model.getAllOrdersInfo()
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }

      const orders = result.result
      res.render(
        "admin_new_delivery",
        {
          paths: app_config.paths,
          orders: orders
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

router.post("/new-delivery", async function (req, res) {
  if (!req.session.admin_loggedin) {
    return res.redirect("/admin/login")
  }

  const { description, long_desc, date, time, order_ids } = req.body
  if (!description || !date || !time || !order_ids) {
    return res.redirect("/admin/new-delivery?error=missing_fields")
  }

  const orderIds = Array.isArray(order_ids) ? order_ids : [order_ids]

  try {
    // combine date and time into a timestamp string (local) usable by Postgres
    function combineDateAndTime(dateStr, timeStr) {
      // dateStr expected 'YYYY-MM-DD', timeStr expected 'HH:MM' (24h)
      const [y, m, d] = dateStr.split('-').map(Number)
      const [hh, mm] = timeStr.split(':').map(Number)
      // construct a local Date then format as 'YYYY-MM-DD HH:MM:SS'
      const dt = new Date(y, m - 1, d, hh || 0, mm || 0, 0)
      const pad = n => String(n).padStart(2, '0')
      return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
    }

    const datetime = combineDateAndTime(date, time)
    console.log("Date:", date, "Time:", time)
    console.log("Creating delivery:", { description, long_desc, datetime, orderIds })

    // Use deliveries_model to handle everything
    const deliveryResult = await deliveries_model.create({
      description,
      long_desc: long_desc || null,
      date: datetime,
      status: 0, // default status: Pending
      order_ids: orderIds
    })

    if (deliveryResult.status !== 201) {
      console.error("Delivery creation failed:", deliveryResult.message)
      return res.redirect("/admin/new-delivery?error=transaction_failed")
    }

    // Successfully created delivery
    res.redirect("/admin/deliveries")

  } catch (error) {
    console.error("Unexpected error creating delivery:", error)
    res.redirect("/admin/new-delivery?error=transaction_failed")
  }
})



module.exports = router
