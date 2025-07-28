import {config} from 'dotenv'
config()

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN
export const RESEND_KEY = process.env.RESEND_KEY