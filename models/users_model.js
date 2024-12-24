const users_db = require("../database/users_db.js")

var users_model = {
  async createUser(username, password_hash, name, address_type, address_details, contact_type, contact_details) {
    try {
      const result = await users_db.createUser(
        username, password_hash, name, address_type, address_details, contact_type, contact_details
      )
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

  async getUserByUsername(username) {
    try {
      const result = await users_db.getUserByUsername(username)
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

  async getUserByUserId(user_id) {
    try {
      const result = await users_db.getUserByUserId(user_id)
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

  async updatePasswordHashByUserId(user_id, password_hash) {
    try {
      const result = await users_db.updatePasswordHashByUserId(user_id, password_hash)
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

  async getAdminPasswordHashByUsername(username) {
    try {
      const result = await users_db.getAdminPasswordHashByUsername(username)
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
}

module.exports = users_model
