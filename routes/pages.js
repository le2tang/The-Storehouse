const app_config = require("../config/app_config.js")
const items_model = require("../models/items_model.js")
const users_model = require("../models/users_model.js")

var router = require("express").Router()

router.get("/", (req, res) => {
  res.redirect("/marketplace")
})

router.get("/favicon.ico", (req, res) => { res.status(204) })

router.get(
  "/marketplace",
  async function (req, res) {
    if (!req.session.loggedin || !req.session.user_id) {
      return res.redirect("/user/login")
    }

    try {
      var result = await users_model.getUserByUserId(req.session.user_id)
      if (result.status != 200) {
        return res.status(result.status).send({ message: result.message })
      }
      user = result.result
      name = user.name
      username = user.username

      result = await items_model.getRemaining()
      if (result.status != 200) {
        return res.status(result.status).send(result.message)
      }
      items = result.result
      res.render(
        "marketplace",
        {
          paths: app_config.paths,
          items: items,
          name: name,
          username: username
        }
      )
    } catch (error) {
      res.status(500).send({ message: error })
    }
  }
)

module.exports = router
