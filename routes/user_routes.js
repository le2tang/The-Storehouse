const app_config = require("../config/app_config.js")
const users_model = require("../models/users_model.js")

const bcrypt = require("bcrypt")

const router = require("express").Router()

router.get(
  "/create",
  (req, res) => {
    res.render("user_create")
  }
)
router.post(
  "/create",
  async (req, res) => {
    try {
      const input_username = req.body.username
      username = input_username.replace(/\W/g, "")

      if (input_username != username) {
        return res.status(400).send("Username contains invalid characters")
      }

      try {
        const query_users = await users_model.getUserByUsername(username)
        if (!(query_users.status == 400 && query_users.message == "USERNAME_NOT_FOUND")) {
          return res.status(400).send("Username already exists")
        }
      } catch (error) {
        console.log(error)
        return res.status(500).send(`Querying database for user failed with error: ${error}`)
      }

      try {
        const num_salt_rounds = 10

        const salt = await bcrypt.genSalt(num_salt_rounds)
        const hash = await bcrypt.hash(req.body.password, salt)

        users_model.createUser(
          username, hash,
          req.body.name,
          req.body.address_type,
          req.body.address_details,
          req.body.contact_type,
          req.body.contact_details
        ).then((result) => {
          if (result.status != 201) {
            return res.status(result.status).send(result.message)
          }

          return res.redirect("/user/login")
        }).catch((error) => {
          console.log(error)
          return res.status(500).send(`Writing to database failed with error ${error}`)
        })
      }
      catch (error) {
        console.log(error)
        return res.status(500).send(`bcrypt failed with error: ${error}`)
      }
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

router.get(
  "/login",
  function (req, res) {
    if (!req.session.loggedin) {
      res.render("login", { paths: app_config.paths })
    }
    else {
      res.redirect("/marketplace")
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
      const query_users = await users_model.getUserByUsername(username)
      if (query_users.status == 400 && query_users.message == "USERNAME_NOT_FOUND") {
        return res.status(404).send("Username not found")
      }

      user_id = query_users.result.user_id
      password_hash = query_users.result.password_hash

      try {
        var result = await bcrypt.compare(input_password, password_hash)
        if (!result) {
          return res.status(400).send("Incorrect password")
        }

        req.session.loggedin = true;
        req.session.user_id = user_id
        return res.redirect("/marketplace")
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
  res.redirect("/")
})


module.exports = router