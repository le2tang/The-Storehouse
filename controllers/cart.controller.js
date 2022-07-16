const cart_model = require("../models/cart.model.js")

exports.createNew = (req, res) => {
  if (!req.body) {
    res.status(400).send({message: "Invalid request"})
  }

  cart_model.create(req.body, (err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.getAll = (req, res) => {
  cart_model.getAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.removeAll = (req, res) => {
  cart_model.removeAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send({message: "All carts removed"})
    }
  })
}

exports.getByUsername = (req, res) => {
  cart_model.getByUsername(req.params.username, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Cart with username: ${req.params.username} not found`})
      }
      else {
        res.status(500).send({message: err.message})
      }
    }
    else {
      res.send(data)
    }
  })
}

exports.updateByUsername = (req, res) => {
  cart_model.updateByUsername(req.params.username, req.body, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Cart with username: ${req.params.username} not found`})
      }
      else {
        res.status(500).send({message: err.message})
      }
    }
    else {
      res.send(data)
    }
  })
}

exports.removeByUsername = (req, res) => {
  cart_model.removeByUsername(req.params.username, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Cart with username: ${req.params.username} not found`})
      }
      else {
        res.status(500).send({message: err.message})
      }
    }
    else {
      res.send({message: `Removed cart with username: ${req.params.username}`})
    }
  })
}
