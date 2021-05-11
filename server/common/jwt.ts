
import { EncryptJWT } from 'jose/jwt/encrypt'
import { jwtDecrypt } from 'jose/jwt/decrypt'
import { jwtVerify } from 'jose/jwt/verify'
import { SignJWT } from 'jose/jwt/sign'

import { createSecretKey } from 'crypto'

const secretKey = createSecretKey(Buffer.from(process.env.JWT_SECRET_KEY))

