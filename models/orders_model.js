const orders_db = require("../database/orders_db.js")

const orders_model = {
  async create(order) {
    if (!("user_id" in order)) {
      return {
        status: 400,
        message: "Missing USER_ID"
      }
    }
    if (!("items" in order)) {
      return {
        status: 400,
        message: "Missing ITEMS"
      }
    }

    try {
      const result = await orders_db.create(order)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }
      return {
        status: 201,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getAllOrdersInfo() {
    try {
      const result = await orders_db.getAllOrdersInfo()
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getAllOrdersPacked() {
    try {
      const result = await orders_db.getAllOrdersPacked()
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getOrderByOrderId(order_id) {
    try {
      const result = await orders_db.getOrderByOrderId(order_id)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getOrdersByUserId(user_id) {
    try {
      const result = await orders_db.getOrdersByUserId(user_id)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async removeOrderByOrderId(order_id) {
    try {
      const result = await orders_db.removeOrderByOrderId(order_id)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async updateStatusByOrderId(order_id, status) {
    if (status < 0 || status >= Object.keys(orders_db.status_text).length) {
      return {
        status: 400,
        message: "Invalid STATUS"
      }
    }

    try {
      const result = await orders_db.updateStatusByOrderId(order_id, status)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async getOrderItemsByOrderId(order_id) {
    try {
      const result = await orders_db.getOrderItemsByOrderId(order_id)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  async updateOrderItemsQuantity(order_id, item_id, quantity) {
    try {
      const result = await orders_db.updateOrderItemsQuantity(order_id, item_id, quantity)
      if (result.status != "OK") {
        return {
          status: 400,
          message: result.message
        }
      }

      return {
        status: 200,
        result: result.result
      }
    } catch (error) {
      return {
        status: 500,
        message: error
      }
    }
  },

  getSummary(orders) {
    var counts = {
      "pending": 0,
      "packed": 0,
      "delivered": 0,
      "total": 0
    }

    for (var order of orders) {
      switch (order.status) {
        case "Pending":
          counts.pending += 1
          break
        case "Packed":
          counts.packed += 1
          break
        case "Delivered":
          counts.delivered += 1
          break
      }
      counts.total += 1
    }
    return counts
  }
}

module.exports = orders_model
