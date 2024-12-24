const orders_model = require("../models/orders_model.js")

const router = require("express").Router()

router.post(
  "/create/:order_id",
  async function (req, res, next) {
    // Sanitize data
    order_id = req.params.order_id

    try {
      const result = await orders_model.create(order)

      if (result.status == 201) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: Create Order, '${error}'`
      )
    }
  }
)

router.get(
  "/delete/:order_id",
  async function (req, res, next) {
    // Sanitize data
    order_id = req.params.order_id

    try {
      const result = await orders_model.removeOrderByOrderId(order_id)
      res.status(result.status).send(result.message)
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: Delete Order, '${error}'`
      )
    }
  }
)

router.get(
  "/view/order/:order_id",
  async function (req, res, next) {
    // Sanitize data
    order_id = req.params.order_id

    try {
      const result = await orders_model.getOrderByOrderId(order_id)

      if (result.status == 200) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: View Order, '${error}'`
      )
    }
  }
)


router.get(
  "/view/user/:user_id",
  async function (req, res, next) {
    // Sanitize data
    user_id = req.params.user_id

    try {
      const result = await orders_model.getOrdersByUserId(user_id)

      if (result.status == 200) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: View Order, '${error}'`
      )
    }
  }
)

router.put(
  "/edit/quantity/:order_id",
  async function (req, res, next) {
    //Sanitize

    try {
      const result = await orders_model.updateOrderItemQuantity(order_id, item_id, quantity)

      if (result.status == 200) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: View Order, '${error}'`
      )
    }
  }
)

router.get(
  "/admin/all",
  async function (req, res, next) {
    //Authenticate

    // Sanitize data
    try {
      const result = await orders_model.getAllOrdersInfo()

      if (result.status == 200) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: View All Orders, '${error}'`
      )
    }
  }
)

router.put(
  "/edit/status/:order_id",
  async function (req, res, next) {
    //Authenticate

    // Sanitize
    order_id = req.params.order_id
    status = req.body.status

    try {
      const result = await orders_model.updateStatusByOrderId(order_id, status)

      if (result.status == 200) {
        return res.status(result.status).send(result.result)
      } else {
        return res.status(result.status).send(result.message)
      }
    } catch (error) {
      console.log(error)
      return res.status(500).send(
        `Internal server error: View Order, '${error}'`
      )
    }
  }
)

module.exports = router
