const app_config = require("../config/app_config.js")
const carts_model = require("../models/carts_model.js")
const items_model = require("../models/items_model.js")

var router = require("express").Router()

router.get(
  "/",
  async function (req, res) {
    const result = await items_model.getAll()
    if (result.status != 200) {
      return res.status(result.status).send(result.message)
    }
    res.render(
      "marketplace",
      {
        paths: app_config.paths,
        items: result.result
      }
    )
  }
)

router.get("/user/:username", async function (req, res) {
  if (!req.body) {
    res.status(400).send({ message: "Invalid request" })
  }

  carts_model.getCartsByUsername(req.params.username).then(
    function (carts) {
      carts.forEach(function (cart) {
        cart.address = null
        cart.arrival = null
        cart.contact_method = null
        cart.contact_address = null
        cart.status = null
      })
      res.render("user_carts_view", { paths: app_config.paths, carts: carts })
    }
  ).catch(
    function (err) {
      res.status(500).send({ message: err })
    }
  )
})

module.exports = router
