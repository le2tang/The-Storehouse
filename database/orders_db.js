const database = require("./database.js")

var orders_db = {
  async create(order) {
    const curr_time = new Date().toISOString().split('T')[0]

    try {
      await database.query("BEGIN");

      var result = await database.query(
        `INSERT INTO orders (user_id, status, created, modified) VALUES ($1, $2, $3, $3)`,
        [order.user_id, 0, curr_time]
      )
      if (result.rowCount == 0) {
        await database.query("ROLLBACK")
        return {
          status: "ERROR",
          error: "ORDER_NOT_CREATED"
        }
      }

      result = await database.query(
        `SELECT MAX(orders.order_id) FROM orders WHERE user_id=$1 GROUP BY user_id`,
        [order.user_id]
      )
      if (result.rowCount == 0) {
        await database.query("ROLLBACK")
        return {
          status: "ERROR",
          error: "ORDER_ID_NOT_FOUND"
        }
      }
      order_id = result.rows[0].max

      const confirmed_items = {}
      for (const item_id in order.items) {
        result = await database.query(
          `WITH items_remaining AS (
            SELECT items.uid, items.quantity-COALESCE(SUM(order_items.quantity), 0) AS remaining
            FROM items LEFT JOIN order_items ON (items.uid=order_items.item_id)
            GROUP BY items.uid
          )
          INSERT INTO order_items (order_id, item_id, quantity)
          SELECT ${order_id}, uid, ${order.items[item_id]}
          FROM items_remaining
          WHERE uid=${item_id} AND remaining>=${order.items[item_id]}`
        )

        if (result.rowCount == 0) {
          // Not enough items remaining
          confirmed_items[item_id] = 0
        } else {
          confirmed_items[item_id] = order.items[item_id]
        }
      }

      await database.query("COMMIT")
      return {
        status: "OK",
        result: confirmed_items
      }
    } catch (error) {
      await database.query("ROLLBACK")

      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async getAllOrdersInfo() {
    try {
      const result = await database.query(
        `SELECT * FROM orders ORDER BY user_id, status ASC, modified DESC`
      )
      orders_info = result.rows

      for (const order_info in orders_info) {
        orders_info[order_info].status = orders_db.status_text[orders_info[order_info].status]
      }

      return {
        status: "OK",
        result: orders_info
      }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async getOrderByOrderId(order_id) {
    try {
      var result = await database.query(
        `SELECT * FROM orders WHERE order_id=$1 ORDER BY modified DESC`,
        [order_id]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          error: "ORDER_ID_NOT_FOUND"
        }
      }
      order = result.rows[0]

      order.status = orders_db.status_text[order.status]

      result = await database.query(
        `SELECT it.uid, it.itemname, oit.quantity, it.description, it.tags
        FROM order_items oit
        LEFT JOIN items it
        ON oit.item_id = it.uid
        WHERE oit.order_id=$1`,
        [order_id]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          error: "ITEM_NOT_FOUND"
        }
      }
      order.items = result.rows

      return {
        status: "OK",
        result: order
      }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async getOrdersByUserId(user_id) {
    try {
      var result = await database.query(
        `SELECT * FROM orders WHERE user_id=$1 ORDER BY modified DESC`,
        [user_id]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          error: "USER_ID_NOT_FOUND"
        }
      }
      orders_info = result.rows

      for (const order_info in orders_info) {
        orders_info[order_info].status = orders_db.status_text[orders_info[order_info].status]
      }

      result = await database.query(
        `SELECT oit.order_id, it.uid, it.itemname, oit.quantity, it.description, it.tags
        FROM order_items oit
        LEFT JOIN orders o
        ON o.order_id = oit.order_id
        LEFT JOIN items it
        ON oit.item_id = it.uid
        WHERE o.user_id=${user_id}`
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          error: "ITEM_NOT_FOUND"
        }
      }
      orders_items = result.rows

      orders = []
      for (const order_info in orders_info) {
        order = orders_info[order_info]
        order.items = orders_items.filter(
          (item) => { return item.order_id == order.order_id }
        )
        order.items = orders_items.map(
          (item) => {
            return {
              uid: item.uid,
              itemname: item.itemname,
              quantity: item.quantity,
              description: item.description,
              tags: item.tags
            }
          }
        )
        orders.push(order)
      }

      return {
        status: "OK",
        result: orders
      }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async removeOrderByOrderId(order_id) {
    try {
      await database.query("BEGIN")

      var result = await database.query(
        `DELETE FROM order_items WHERE order_id=$1`
        [order_id]
      )

      result = await database.query(
        `DELETE FROM orders WHERE order_id=$1`,
        [order_id]
      )
      if (result.rowCount == 0) {
        await database.query("ROLLBACK")
        return {
          status: "ERROR",
          error: "ORDER_ID_NOT_FOUND"
        }
      }

      await database.query("COMMIT")
      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      await database.query("ROLLBACK")

      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async updateStatusByOrderId(order_id, status) {
    const curr_time = new Date().toISOString().split('T')[0]
    try {
      const result = await database.query(
        `UPDATE orders SET status=$1, modified=$2 WHERE order_id=$3`,
        [status, curr_time, order_id]
      )
      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async getOrderItemsByOrderId(order_id) {
    try {
      const result = await database.query(
        `SELECT i.* FROM items i
        WHERE i.uid IN (SELECT oi.item_id FROM order_items oi WHERE order_id=$1)
        ORDER BY itemname`,
        [order_id]
      )
      return {
        status: "OK",
        result: result.rows
      }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async updateOrderItemQuantity(order_id, item_id, quantity) {
    const curr_time = new Date().toISOString().split('T')[0]
    try {
      await database.query("BEGIN")

      var result = await database.query(
        `WITH items_remaining AS (
          SELECT items.uid, items.quantity-SUM(order_items.quantity) AS remaining
          FROM items LEFT JOIN order_items ON (items.uid=order_items.item_id)
          WHERE order_items.order_id!=$1 AND item_id=$2
          GROUP BY items.uid
        )
        UPDATE order_items SET quantity=$3 WHERE order_id=$1 AND item_id=(
          SELECT uid FROM items_remaining WHERE uid=$2 AND remaining>=$3
        )`,
        [order_id, item_id, quantity]
      )

      result = await database.query(
        `DELETE FROM order_items WHERE order_id=$1 AND quantity=0`,
        [order_id]
      )

      result = await database.query(
        `UPDATE orders SET status=$1 WHERE order_id=$1`,
        [order_id]
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
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async setupOrdersTable() {
    try {
      const result = await database.query(
        `CREATE TABLE IF NOT EXISTS orders (
          order_id SERIAL PRIMARY KEY NOT NULL,
          user_id SERIAL REFERENCES users(uid),
          status INT,
          created TIMESTAMP,
          modified TIMESTAMP
        )`
      )
      return { status: "OK" }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  async setupOrderItemsTable() {
    try {
      const result = await database.query(
        `CREATE TABLE IF NOT EXISTS order_items (
          order_id SERIAL REFERENCES orders(order_id),
          item_id SERIAL REFERENCES items(uid),
          quantity INT NOT NULL CHECK (quantity >= 0)
        )`
      )
      return { status: "OK" }
    } catch (error) {
      return {
        status: "ERROR",
        error: error.code in orders_db.error_codes ? orders_db.error_codes[error.code] : error.code
      }
    }
  },

  error_codes: {
    "23503": "USER_NOT_FOUND"
  },

  status_text: {
    "0": "Pending",
    "1": "Packed",
    "2": "Delivered"
  }
}

orders_db.setupOrdersTable()
orders_db.setupOrderItemsTable()

module.exports = orders_db