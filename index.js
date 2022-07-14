// Serverside main code

const express = require("express")
const app = express()

// Add middleware to parse requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Setup routes
app.get("/", (req, res) => {
  res.send("Hello world")
})

// Start serving
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})