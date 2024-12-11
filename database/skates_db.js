const database = require("./database.js")

var skates_db = {
  async createSkateInventory(tag_num, size, description) {
    size = Math.round(size * 10) / 10
    if (!description) {
      description = ""
    }

    var query = `INSERT INTO skates_inventory (tag_num, size, category) \
      VALUES ('${tag_num}', '${size}', '${category}')`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating skate inventory entry ", query)
      console.log(err)
    }
  },

  async createSkateReservation(user_id, tag_num, start_date, end_date) {
    var query = `INSERT INTO skates_reservation (user_id, tag_num, start_date, end_date, created_on, modified_on, approved_on) \
      VALUES ('${user_id}', '${tag_num}', '${start_date}', '${end_date}', 'to_timestamp(${Date.now()} / 1000.0)', NULL, NULL)`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating skate inventory entry ", query)
      console.log(err)
    }
  },

  async getSkatesBySize(size) {
    var query = `SELECT * FROM skates_inventory WHERE size='${size}'`
    try {
      var result = await database.query(query)
      return result.rows
    } catch (err) {
      console.log("Error fetching skate inventory query ", query)
      console.log(err)
    }
  },

  async getSkatesByTagNum(tag_num) {
    var query = `SELECT * FROM skates_inventory WHERE tag_num='${tag_num}'`
    try {
      var result = await database.query(query)
      return result.rows
    } catch (err) {
      console.log("Error fetching skate inventory query ", query)
      console.log(err)
    }
  },

  async getReservationsByUserid(user_id) {
    var query = `SELECT * FROM skates_reservation WHERE user_id='${user_id}'`
    try {
      var result = await database.query(query)
      return result.rows
    } catch (err) {
      console.log("Error fetching skate reservation query ", query)
      console.log(err)
    }
  },

  async getReservationsByTagNum(tag_num) {
    var query = `SELECT * FROM skates_reservation WHERE tag_num='${tag_num}'`
    try {
      var result = await database.query(query)
      return result.rows
    } catch (err) {
      console.log("Error fetching skate reservation query ", query)
      console.log(err)
    }
  },

  async setupSkatesInventoryTable() {
    var query = `CREATE TABLE IF NOT EXISTS skates_inventory (
      tag_num INT PRIMARY KEY NOT NULL,
      size_type CHAR(3),
      size NUMERIC(3, 1)
    )`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating skates_inventory table ", query)
      console.log(err)
    }
  },

  async setupSkatesReservationTable() {
    var query = `CREATE TABLE IF NOT EXISTS skates_reservation (
      uid SERIAL,
      user_id INT PRIMARY KEY NOT NULL,
      tag_num INT,
      start_date DATE,
      end_date DATE,
      created_on TIMESTAMP,
      modified_on TIMESTAMP,
      approved_on TIMESTAMP
    )`
    try {
      var result = await database.query(query)
      return result
    } catch (err) {
      console.log("Error creating skates table ", query)
      console.log(err)
    }
  }
}

skates_db.setupSkatesInventoryTable()
skates_db.setupSkatesReservationTable()

module.exports = skates_db
