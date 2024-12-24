const app_config = require("../config/app_config.js")
const carts_model = require("../models/carts_model.js")
const items_model = require("../models/items_model.js")

var router = require("express").Router()

router.get("/", (req, res) => {
  res.redirect("/users/login")
})

router.get(
  "/marketplace",
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

module.exports = router
