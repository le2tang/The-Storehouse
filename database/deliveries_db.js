const database = require("./database.js")

var deliveries_db = {
  async create(delivery) {
    try {
      const curr_time = new Date().toISOString()

      // Server-side validation for description and long_desc lengths
      if (delivery.description && delivery.description.length > 20) {
        return { status: 400, message: "DESCRIPTION_TOO_LONG" }
      }

      if (delivery.long_desc && delivery.long_desc.length > 300) {
        return { status: 400, message: "LONG_DESCRIPTION_TOO_LONG" }
      }

      await database.query("BEGIN")

      // Insert into deliveries table
      var result = await database.query(
        `INSERT INTO deliveries (description, long_desc, date, status, created, modified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING delivery_id`,
        [delivery.description, delivery.long_desc || null, delivery.date, delivery.status, curr_time, curr_time]
      )

      const delivery_id = result.rows[0].delivery_id

      // Insert order_ids into delivery_orders junction table and update order status and delivery_id
      if (delivery.order_ids && delivery.order_ids.length > 0) {
        for (const order_id of delivery.order_ids) {
          // Insert into delivery_orders junction table
          await database.query(
            `INSERT INTO delivery_orders (delivery_id, order_id) VALUES ($1, $2)`,
            [delivery_id, order_id]
          )
          
          // Update order status to 3 (Scheduled) and assign delivery_id
          await database.query(
            `UPDATE orders SET status = 3, delivery_id = $1, modified = $2 WHERE order_id = $3`,
            [delivery_id, curr_time, order_id]
          )
        }
      }

      await database.query("COMMIT")
      return {
        status: "OK",
        result: { delivery_id, order_count: delivery.order_ids?.length || 0 }
      }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")

      return { status: 400, message: error.message || error.toString() }

    }
  },

  async updateDeliveryByDeliveryId(delivery) {
    try {
      const curr_time = new Date().toISOString()

      await database.query("BEGIN")

      var result = await database.query(
        `UPDATE deliveries SET description=$1, long_desc=$2, date=$3, status=$4, modified=$5 WHERE delivery_id=$6`,
        [delivery.description, delivery.long_desc || null, delivery.date, delivery.status, curr_time, delivery.delivery_id]
      )

      if (result.rowCount === 0) {
        await database.query("ROLLBACK")
        return {
          status: "ERROR",
          message: "DELIVERY_NOT_FOUND"
        }
      }

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

  async updateDeliveryFull(delivery) {
    try {
      const curr_time = new Date().toISOString()

      await database.query("BEGIN")

      // Update deliveries table
      var result = await database.query(
        `UPDATE deliveries SET description=$1, long_desc=$2, date=$3, status=$4, modified=$5 WHERE delivery_id=$6`,
        [delivery.description, delivery.long_desc || null, delivery.date, delivery.status, curr_time, delivery.delivery_id]
      )

      if (result.rowCount === 0) {
        await database.query("ROLLBACK")
        return { status: "ERROR", message: "DELIVERY_NOT_FOUND" }
      }

      // If order_ids provided, sync delivery_orders
      if (delivery.order_ids) {
        // fetch existing order ids
        const existingRes = await database.query(
          `SELECT order_id FROM delivery_orders WHERE delivery_id=$1`,
          [delivery.delivery_id]
        )
        const existing = existingRes.rows.map(r => String(r.order_id))
        const incoming = delivery.order_ids.map(String)

        const toAdd = incoming.filter(id => !existing.includes(id))
        const toRemove = existing.filter(id => !incoming.includes(id))

        for (const order_id of toAdd) {
          await database.query(`INSERT INTO delivery_orders (delivery_id, order_id) VALUES ($1, $2)`, [delivery.delivery_id, order_id])
          await database.query(`UPDATE orders SET status = 3, delivery_id = $1, modified = $2 WHERE order_id = $3`, [delivery.delivery_id, curr_time, order_id])
        }

        for (const order_id of toRemove) {
          await database.query(`DELETE FROM delivery_orders WHERE delivery_id=$1 AND order_id=$2`, [delivery.delivery_id, order_id])
          await database.query(`UPDATE orders SET status = 1, delivery_id = NULL, modified = $1 WHERE order_id = $2`, [curr_time, order_id])
        }
      }

      await database.query("COMMIT")
      return { status: "OK", result: result.rowCount }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")
      return { status: "ERROR", message: error }
    }
  },

  async deleteDeliveryByDeliveryId(delivery_id) {
    try {
      const curr_time = new Date().toISOString()
      await database.query("BEGIN")

      // get orders for this delivery
      const ordersRes = await database.query(`SELECT order_id FROM delivery_orders WHERE delivery_id=$1`, [delivery_id])
      const orderIds = ordersRes.rows.map(r => r.order_id)

      for (const order_id of orderIds) {
        await database.query(`UPDATE orders SET status = 1, delivery_id = NULL, modified = $1 WHERE order_id = $2`, [curr_time, order_id])
      }

      await database.query(`DELETE FROM delivery_orders WHERE delivery_id=$1`, [delivery_id])

      const delRes = await database.query(`DELETE FROM deliveries WHERE delivery_id=$1`, [delivery_id])
      if (delRes.rowCount === 0) {
        await database.query("ROLLBACK")
        return { status: "ERROR", message: "DELIVERY_NOT_FOUND" }
      }

      await database.query("COMMIT")
      return { status: "OK", result: delRes.rowCount }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")
      return { status: "ERROR", message: error }
    }
  },

  async markDeliveryAsDelivered(delivery_id) {
    try {
      const curr_time = new Date().toISOString()
      await database.query("BEGIN")

      const res1 = await database.query(`UPDATE deliveries SET status=3, modified=$1 WHERE delivery_id=$2`, [curr_time, delivery_id])
      if (res1.rowCount === 0) {
        await database.query("ROLLBACK")
        return { status: "ERROR", message: "DELIVERY_NOT_FOUND" }
      }

      // mark orders as delivered (status = 2)
      await database.query(`UPDATE orders SET status = 2, modified = $1 WHERE delivery_id = $2`, [curr_time, delivery_id])

      await database.query("COMMIT")
      return { status: "OK", result: true }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")
      return { status: "ERROR", message: error }
    }
  },

  async markDeliveryAsUndelivered(delivery_id) {
    try {
      const curr_time = new Date().toISOString()
      await database.query("BEGIN")

      const res1 = await database.query(`UPDATE deliveries SET status=0, modified=$1 WHERE delivery_id=$2`, [curr_time, delivery_id])
      if (res1.rowCount === 0) {
        await database.query("ROLLBACK")
        return { status: "ERROR", message: "DELIVERY_NOT_FOUND" }
      }

      // mark orders as undelivered (status = 0)
      await database.query(`UPDATE orders SET status = 0, modified = $1 WHERE delivery_id = $2`, [curr_time, delivery_id])

      await database.query("COMMIT")
      return { status: "OK", result: true }
    } catch (error) {
      console.log(error)
      await database.query("ROLLBACK")
      return { status: "ERROR", message: error }
    }
  },

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
        `SELECT d.delivery_id, d.order_id, o.user_id,o.status, u.name, u.contact_type, u.contact_details, u.address_type, u.address_details
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
      for (const order_info in delivery_info.orders) {
      delivery_info.orders[order_info].status = deliveries_db.order_status_text[delivery_info.orders[order_info].status]
      }


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

  async getAll() {
    try {
      var result = await database.query(
        `SELECT * FROM deliveries ORDER BY date DESC`
      )
      deliveries_info = result.rows
      for (const delivery_info of deliveries_info) {
        delivery_info.status = deliveries_db.status_text[delivery_info.status]
      }

      return {
        status: "OK",
        result: deliveries_info
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
          description VARCHAR(20),
          date DATE,
          status INT,
          created TIMESTAMP,
          modified TIMESTAMP,
          long_desc VARCHAR(300)
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
  },

  order_status_text: {
    "0": "Pending",
    "1": "Packed",
    "2": "Delivered",
    "3": "Scheduled",
    "4": "Deleted"
  }
}

deliveries_db.setupDeliveriesTable()

module.exports = deliveries_db