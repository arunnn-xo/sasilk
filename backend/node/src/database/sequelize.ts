import { Sequelize } from 'sequelize'
import { env } from '../config/env.js'

function quoteIdentifier(value: string) {
  return `\`${value.replace(/`/g, '``')}\``
}

// TiDB Cloud Serverless requires SSL — enabled when DB_SSL=true or NODE_ENV=production
const useSSL = process.env.DB_SSL === 'true' || env.NODE_ENV === 'production'
const sslDialectOptions = useSSL
  ? { ssl: { rejectUnauthorized: true } }
  : {}

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: env.DB_DIALECT,
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ...sslDialectOptions,
    connectTimeout: 20000,
  },
})

export async function assertDatabaseConnection() {
  await sequelize.authenticate()
}

export async function ensureDatabaseExists() {
  const bootstrap = new Sequelize('', env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      ...sslDialectOptions,
      connectTimeout: 20000,
    },
  })

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(env.DB_NAME)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await bootstrap.close()
}

