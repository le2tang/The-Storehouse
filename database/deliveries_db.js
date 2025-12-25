const database = require("./database.js")

var deliveries_db = {
  async create(delivery) {
    try {
      const curr_time = new Date().toISOString()

      await database.query("BEGIN");

      var result = await database.query(
        `INSERT INTO deliveries (description, date, order_ids, status, created, modified) VALUES ($1, $2, $3, $3)`,
        [delivery.description, delivery.date, delivery.order_ids, delivery.status, curr_time]
      )

      await database.query("COMMIT")
      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")

      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async updateDeliveryByDeliveryId(delivery) {

  }

  async getDeliveriesByDateRange(start_date, end_date) {
    try {
      var result = await database.query(
        `SELECT * FROM deliveries WHERE date>=${start_date} AND date<=${end_date}`
      )
      deliveries_info = result.rows
      for (const delivery_info in deliveries_info) {
        deliveries_info[delivery_info].status = deliveries_db.status_text[deliveries_info[delivery_info].status]
      }

      result = await database.query(
        `SELECT d.delivery_id, d.order_id, o.user_id, u.name, u.contact_type, u.contact_details, u.address_type, u.address_details
        FROM delivery_orders d
        LEFT JOIN orders o
        ON d.order_id = o.order_id
        LEFT JOIN users u
        ON o.user_id = u.user_id
        WHERE d.delivery_id=${delivery_id}
        ORDER BY u.address_type ASC, u.name ASC`
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "ORDERS_NOT_FOUND"
        }
      }
      delivery_orders = result.rows

      for (const delivery_info in deliveries_info) {
        delivery = deliveries_info[delivery_info]

        delivery.orders = delivery_orders.filter(
          (order) => { return order.delivery_id == delivery.delivery_id }
        )
      }

      console.log(deliveries_info)

      return {
        status: "OK",
        result: delivery_info
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getDeliveryByDeliveryId(delivery_id) {
    try {
      var result = await database.query(
        `SELECT * FROM deliveries WHERE delivery_id=${delivery_id}`
      )
      delivery_info = result.rows[0]
      delivery_info.status = deliveries_db.status_text[delivery_info.status]

      result = await database.query(
        `SELECT d.delivery_id, d.order_id, o.user_id, u.name, u.contact_type, u.contact_details, u.address_type, u.address_details
        FROM delivery_orders d
        LEFT JOIN orders o
        ON d.order_id = o.order_id
        LEFT JOIN users u
        ON o.user_id = u.user_id
        WHERE d.delivery_id=${delivery_id}
        ORDER BY u.address_type ASC, u.name ASC`
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "ORDERS_NOT_FOUND"
        }
      }
      delivery_info.orders = result.rows

      return {
        status: "OK",
        result: delivery_info
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async setupDeliveriesTable() {
    console.log("Setup deliveries table ")
    try {
      await database.query("BEGIN")

      var result = await database.query(
        `CREATE TABLE IF NOT EXISTS deliveries (
          delivery_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
          description VARCHAR(64),
          date DATE,
          status INT,
          created TIMESTAMP,
          modified TIMESTAMP
        )`
      )

      result = await database.query(
        `CREATE TABLE IF NOT EXISTS delivery_orders (
          delivery_id SERIAL REFERENCES deliveries(delivery_id),
          order_id SERIAL REFERENCES orders(order_id)
        )`
      )

      await database.query("COMMIT")
      return { status: "OK" }
    } catch (error) {
      console.log("Could not setup table", error)
      await database.query("ROLLBACK")
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  status_text: {
    "0": "Pending",
    "1": "Packed",
    "2": "Arranged",
    "3": "Delivered",
  }
}

deliveries_db.setupDeliveriesTable()

module.exports = deliveries_db