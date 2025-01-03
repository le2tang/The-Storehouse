const { updatePasswordHashByUserId } = require("../models/users_model.js")
const database = require("./database.js")

var users_db = {
  async createUser(username, password_hash, name, address_type, address_details, contact_type, contact_details) {
    try {
      const result = await database.query(
        `INSERT INTO users (username, password_hash, name, address_type, address_details, contact_type, contact_details)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [username, password_hash, name, address_type, address_details, contact_type, contact_details]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "FAILED_TO_INSERT"
        }
      }

      return {
        status: "OK",
        result: result.rowCount
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error.code
      }
    }
  },

  async getUserByUsername(username) {
    try {
      const result = await database.query(
        `SELECT * FROM users WHERE username=$1`,
        [username]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "USERNAME_NOT_FOUND"
        }
      }

      return {
        status: "OK",
        result: result.rows[0]
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getUserByUserId(user_id) {
    try {
      const result = await database.query(
        `SELECT * FROM users WHERE user_id=${user_id}`,
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "USER_ID_NOT_FOUND"
        }
      }

      return {
        status: "OK",
        result: result.rows[0]
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getPasswordHashByUsername(username) {
    try {
      const result = await database.query(
        `SELECT password_hash FROM users WHERE username=$1`,
        [username]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "USERNAME_NOT_FOUND"
        }
      }

      return {
        status: "OK",
        result: result.rows[0]
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async updatePasswordHashByUserId(user_id, password_hash) {
    try {
      const result = await database.query(
        `UPDATE users SET password_hash='${password_hash}' WHERE user_id=${user_id}`,
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "USER_ID_NOT_FOUND"
        }
      }

      return {
        status: "OK",
        result: result.rows[0]
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async getAdminPasswordHashByUsername(username) {
    try {
      const result = await database.query(
        `SELECT password_hash FROM admins WHERE username=$1`,
        [username]
      )
      if (result.rowCount == 0) {
        return {
          status: "ERROR",
          message: "USERNAME_NOT_FOUND"
        }
      }

      return {
        status: "OK",
        result: result.rows[0]
      }
    } catch (error) {
      return {
        status: "ERROR",
        message: error
      }
    }
  },

  async setupUsersTable() {
    try {
      await database.query("BEGIN")

      await database.query(
        `CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY NOT NULL,
          username VARCHAR(32) NOT NULL UNIQUE,
          password_hash VARCHAR(60) NOT NULL,
          name VARCHAR(32) NOT NULL,
          address_type CHAR(3),
          address_details VARCHAR(64),
          contact_type CHAR(3),
          contact_details VARCHAR(32)
        )`
      )

      await database.query(
        `CREATE TABLE IF NOT EXISTS admins (
          username VARCHAR (32) PRIMARY KEY NOT NULL UNIQUE,
          password_hash VARCHAR(60) NOT NULL
        )`
      )
      await database.query("COMMIT")
    } catch (error) {
      await database.query("ROLLBACK")
    }
  }
}

users_db.setupUsersTable()

module.exports = users_db
