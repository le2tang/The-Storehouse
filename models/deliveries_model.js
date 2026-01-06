const deliveries_db = require("../database/deliveries_db.js")

const deliveries_model = {
  async create(delivery) {
    try {
      const result = await deliveries_db.create(delivery)
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

  async getDeliveriesByDateRange(start_date, end_date) {
    if (start_date < end_date) {
      return {
        status: 400,
        message: "Invalid date range"
      }
    }

    try {
      const result = await deliveries_db.getDeliveriesByDateRange(start_date, end_date)
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

  async getDeliveryByDeliveryId(delivery_id) {
    try {
      const result = await deliveries_db.getDeliveryByDeliveryId(delivery_id)
      if (result.status != "OK") {
        // Map DB not-found to 404; other DB errors to 500
        const message = result.message || 'Unknown error'
        if (message === 'DELIVERY_NOT_FOUND') {
          return {
            status: 404,
            message: message
          }
        }

        return {
          status: 500,
          message: message
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

  async update(delivery) {
    try {
      const result = await deliveries_db.updateDeliveryFull(delivery)
      if (result.status != "OK") {
        return { status: 400, message: result.message }
      }
      return { status: 200, result: result.result }
    } catch (error) {
      return { status: 500, message: error }
    }
  },

  async deleteDelivery(delivery_id) {
    try {
      const result = await deliveries_db.deleteDeliveryByDeliveryId(delivery_id)
      if (result.status != "OK") {
        return { status: 400, message: result.message }
      }
      return { status: 200, result: result.result }
    } catch (error) {
      return { status: 500, message: error }
    }
  },

  async markComplete(delivery_id) {
    try {
      const result = await deliveries_db.markDeliveryAsDelivered(delivery_id)
      if (result.status != "OK") {
        return { status: 400, message: result.message }
      }
      return { status: 200, result: result.result }
    } catch (error) {
      return { status: 500, message: error }
    }
  },

  async markUncomplete(delivery_id) {
    try {
      const result = await deliveries_db.markDeliveryAsUndelivered(delivery_id)
      if (result.status != "OK") {
        return { status: 400, message: result.message }
      }
      return { status: 200, result: result.result }
    } catch (error) {
      return { status: 500, message: error }
    }
  },

  async getAll() {
    try {
      const result = await deliveries_db.getAll()
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
  }
}

module.exports = deliveries_model