const express = require("express");
const app = express();

// const admin_router = require("./routes/admin.js");
// const login_router = require("./routes/login.js");
const marketplace_router = require("./routes/marketplace.js");

const path = require("path");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public/views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

// app.use("/admin", admin_router);
// app.use("/login", login_router);
app.use("/marketplace", marketplace_router);

app.use((req, res) => {
  res.status(404).send("Page not found");
})

app.listen(PORT, () => { console.log("Listening on ", PORT); });
