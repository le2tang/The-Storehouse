const item_model = require("../models/item.model.js")

exports.createNew = (req, res) => {
  if (!req.body) {
    res.status(400).send({message: "Invalid request"})
  }

  const new_item = new Item(req.body)
  item_model.create(new_item, (err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.getAll = (req, res) => {
  item_model.getAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send(data)
    }
  })
}

exports.removeAll = (req, res) => {
  item_model.removeAll((err, data) => {
    if (err) {
      res.send({message: err.message})
    }
    else {
      res.send({message: "All items removed"})
    }
  })
}

exports.getByUid = (req, res) => {
  item_model.getByUid(req.params.uid, (err, data) => {
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
  item_model.updateByUid(req.params.uid, new Item(req.body), (err, data) => {
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
  item_model.removeByUid(req.params.uid, (err, data) => {
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
