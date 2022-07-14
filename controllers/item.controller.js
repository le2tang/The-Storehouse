const ItemList = require("../models/item.model.js")

// Create and save a new item
exports.createNew = (req, res) => {
  if (!req.body) {
    res.status(400).send({message: "Invalid request"})
  }

  ItemList.create(req.body, (err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.getAll = (req, res) => {
  ItemList.getAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.removeAll = (req, res) => {
  ItemList.removeAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send({message: "All items removed"})
    }
  })
}

exports.getByUid = (req, res) => {
  ItemList.getByUid(req.params.uid, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Item with UID: ${req.params.uid} not found`})
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

exports.updateByUid = (req, res) => {
  ItemList.updateByUid(req.params.uid, req.body, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Item with UID: ${req.params.uid} not found`})
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

exports.removeByUid = (req, res) => {
  ItemList.removeByUid(req.params.uid, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.status(404).send({message: `Item with UID: ${req.params.uid} not found`})
      }
      else {
        res.status(500).send({message: err.message})
      }
    }
    else {
      res.send({message: `Removed item with UID: ${req.params.uid}`})
    }
  })
}
