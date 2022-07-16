const user_model = require("../models/user.model.js")

exports.createNew = (req, res) => {
  if (!req.body) {
    res.status(400).send({message: "Invalid request"})
  }

  user_model.create(req.body, (err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.getAll = (req, res) => {
  user_model.getAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.removeAll = (req, res) => {
  user_model.removeAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send({message: "All users removed"})
    }
  })
}

exports.getByUsername = (req, res) => {
  user_model.getByUsername(req.params.username, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `User with username: ${req.params.username} not found`})
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
  user_model.updateByUsername(req.params.username, req.body, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `User with username: ${req.params.username} not found`})
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
  user_model.removeByUsername(req.params.username, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `User with username: ${req.params.username} not found`})
      }
      else {
        res.status(500).send({message: err.message})
      }
    }
    else {
      res.send({message: `Removed user with username: ${req.params.username}`})
    }
  })
}
