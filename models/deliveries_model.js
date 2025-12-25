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