const { Pool } = require("pg");

class ItemsDatabase {
  constructor(source) {
    this.source = source;
  }

  async getAllItems() {
    let sql = "SELECT * FROM items";
    return await this.source.query(sql);
  }

  async getItemById(id) {
    let sql = "SELECT * FROM items WHERE id=$1";
    let result = await this.source.query(sql, [id]);
    return result[0];
  }

  async addItem(id, itemname, quantity, description, tags) {
    if (description && description.length == 0) {
      description = null;
    }
    if (tags && tags.length == 0) {
      tags = null;
    }

    let sql = "INSERT INTO items (id, itemname, quantity, description, tags) VALUES ($1, $2, $3, $4, $5)";
    return await this.source.query(sql, [id, itemname, quantity, description, tags]);
  }

  async updateItem(id, itemname, quantity, description, tags) {
    if (description && description.length == 0) {
      description = null;
    }
    if (tags && tags.length == 0) {
      tags = null;
    }
    
    let sql = "UPDATE items SET itemname=$2, quantity=$3, description=$4, tags=$5 WHERE id=$1";
    return await this.source.query(sql, [id, itemname, quantity, description, tags]);
  }

  async setItemQuantity(id, quantity) {
    let sql = "UPDATE items SET quantity=$2 WHERE id=$1";
    return await this.source.query(sql, [id, quantity]);
  }

  async removeItemById(id) {
    let sql = "DELETE FROM items WHERE id=$1";
    return await this.source.query(sql, [id]);
  }
}

class CartsDatabase {
  constructor(source) {
    this.source = source;
  }

  async getAllCarts() {
    let sql = "SELECT * FROM carts";
    return await this.source.query(sql);
  }

  async getCartByUsername(username) {
    let sql = "SELECT * FROM carts WHERE username=$1";
    let result = await this.source.query(sql, [username]);
    return result[0];
  }

  async addCart(username, address, arrival, contact_method, contact_address, items) {
    if (address && address.length == 0) {
      address = null;
    }
    if (arrival && arrival.length == 0) {
      arrival = null;
    }

    let sql = "INSERT INTO carts (username, address, arrival, contact_method, contact_address, items) VALUES ($1, $2, $3, $4, $5, $6)";
    return await this.source.query(sql, [username, address, arrival, contact_method, contact_address, items]);
  }
}

class DataSource {
  constructor() {
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
    }
    else {
      this.pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "postgres",        
        user: "postgres",
        password: "ZXChadD"
      });
    }
  }

  async query(sql, params) {
    return this.pool.query(sql, params)
      .then(res => {
        return res.rows;
      })
      .catch(err => console.log(err.stack));
  }
}

let datasource = new DataSource();
let items_db = new ItemsDatabase(datasource);
let carts_db = new CartsDatabase(datasource);

module.exports.items_db = items_db;
module.exports.carts_db = carts_db;
