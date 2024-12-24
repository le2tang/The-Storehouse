const database = require("./database/database.js")
const orders_db = require("./database/orders_db.js")

async function prepare_tests() {
  await database.query(
    `DELETE FROM order_items`
  )
  await database.query(
    `DELETE FROM orders`
  )
  await database.query(
    `ALTER SEQUENCE orders_order_id_seq RESTART WITH 1`
  )
}

async function run_tests() {
  await orders_db.create({
    user_id: 13,
    status: 0,
    items: {
      2: 1,
      3: 5
    }
  }).then(
    function (result) {
      console.log("Create order", result)
    }
  ).catch(
    function (error) {
      console.log("Error from create order", error)
    }
  )

  await orders_db.create({
    user_id: 14,
    status: 0,
    items: {
      1: 1,
      2: 2
    }
  }).then(
    function (result) {
      console.log("Create order", result)
    }
  ).catch(
    function (error) {
      console.log("Error from create order", error)
    }
  )

  orders_db.create({
    user_id: 13,
    status: 0,
    items: {
      2: 3,
      3: 2
    }
  }).then(
    function (result) {
      console.log("Create order", result)
    }
  ).catch(
    function (error) {
      console.log("Error from create order", error)
    }
  )

  orders_db.updateOrderItemQuantity(1, 3, 2).then(
    function (result) {
      console.log("Update order items quantity", result)
    }
  ).catch(
    function (error) {
      console.log("Error Update order items quantity", error)
    }
  )

  orders_db.getOrderByOrderId(1).then(
    function (result) {
      console.log("Get Order by Order ID", result)
    }
  ).catch(
    function (error) {
      console.log("Error Get Order by Order ID", error)
    }
  )

  orders_db.getOrdersByUserId(13).then(
    function (result) {
      console.log("Get Order by User ID", result)
    }
  ).catch(
    function (error) {
      console.log("Error Get Order by User ID", error)
    }
  )

  var curr_order_id = 0
  all_orders = orders_db.getAllOrdersInfo().then(
    function (result) {
      console.log("Get All Orders Info", result)
      curr_order_id = Math.max(Math,
        result.result.map(
          (order) => { return order.order_id }
        )
      )
    },
    function (result) {
      orders_db.removeOrderByOrderId(curr_order_id).then(
        function (result) {
          console.log("Remove Order by Order ID", result)
        }
      ).catch(
        function (error) {
          console.log("Error Remove Order by Order ID", error)
        }
      )
    }
  ).catch(
    function (error) {
      console.log("Error Get All Orders Info", error)
    }
  )
}

try {
  prepare_tests()
  run_tests()
} catch (error) {
  console.log("Error running Unit tests", error)
}

