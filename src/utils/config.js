import {config} from 'dotenv'
config()

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN
export const RESEND_KEY = process.env.RESEND_KEY

export const MYSQL_DB = process.env.MYSQL_DB
export const MYSQL_HOST = process.env.MYSQL_HOST
export const MYSQL_USER = process.env.MYSQL_USER
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
export const MYSQL_PORT = process.env.MYSQL_PORT
