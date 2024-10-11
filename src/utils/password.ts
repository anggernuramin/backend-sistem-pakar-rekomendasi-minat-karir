import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { environment } from '../config/environment'

// encode password agar tidak dienkripsi
export const hashingPassword = (password: string) => {
  return bcrypt.hashSync(password, 10)
}

// decode password agar bisa di baca
export const checkPassword = (userInputPassword: string, password: string) => {
  return bcrypt.compareSync(userInputPassword, password)
}

// generate token
export const generateToken = (payload: Object, options?: jwt.SignOptions | undefined) => {
  // jwt private key untuk membuat token
  return jwt.sign(payload, environment.jwt_private, {
    ...options,
    algorithm: 'RS256'
  })
}

// verifikasi token
export const verifyToken = (token: string) => {
  try {
    // cek token apakah valid dengan key public
    const decoded = jwt.verify(token, environment.jwt_public)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt expired or not eligable to use',
      decoded: null
    }
  }
}
