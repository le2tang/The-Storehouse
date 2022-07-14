// Serverside main code

const express = require("express")
const app = express()

// Add middleware to parse requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Setup routes
const item_router = require("./routes/item.routes.js")

app.get("/", (req, res) => {
  res.sendFile("./public/index.html", {root: __dirname})
})
app.use((req, res, next) => {
  console.log(req.body)
  next()
})
app.use("/items", item_router)
app.use((req, res) => {
  res.status(404).send("Page not found")
})

// Start serving
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
