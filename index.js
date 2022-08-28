const express = require("express")
const path = require("path")
const session = require("express-session")
const app_config = require("./config/app_config.js")

const app = express()

const pages_router = require("./routes/pages.js")

app.set("view engine", "ejs")
app.use(express.static(path.join(app_config.cwd, "public")))
app.set("views", path.join(app_config.cwd, "public/views"))
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use("", pages_router)
app.use((req, res) => {
  res.status(404).send("Page not found")
})

app.listen(app_config.port, () => { console.log("Listening on ", app_config.port) })
