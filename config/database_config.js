require("dotenv").config();

module.exports = {
  HOST: "localhost",
  PORT: 5432,
  DATABASE: "postgres",
  USER: "postgres",
  PASSWORD: process.env.DB_PASSWORD,
}