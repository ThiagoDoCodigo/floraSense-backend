import { Sequelize } from "sequelize";
import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

const banco = isTest ? `${process.env.DB_TABLE}-TEST` : process.env.DB_TABLE!;
const user = process.env.DB_USERNAME!;
const password = process.env.DB_PASSWORD!;
const host = process.env.DB_HOST!;
const port = Number(process.env.DB_PORT!);

const sequelize = new Sequelize(banco, user, password, {
  host,
  port,
  dialect: "postgres",
  logging: false,
});

export default sequelize;
