import crypto from 'crypto'
import { ulid } from 'ulid'
import type { EncryptionResult } from '../types'

//TODO Setup key rotation and
const ENCRYPTION_KEY = process.env.BASIC_DB_ENCRYPTION_KEY as string;
export function encryptValue(value: string) : EncryptionResult{
    try{
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv("aes-256-gcm",ENCRYPTION_KEY,iv);
        const encryptValue = Buffer.concat([cipher.update(value,"utf-8"),cipher.final()])
        const tag = cipher.getAuthTag()
        const result = Buffer.concat([iv,tag,encryptValue]).toString('base64')
        const hash = crypto.createHash('sha256').update(value).digest('hex')
        const ulid_val = ulid()
        return {
            cipherText: result,
            hash: hash,
            ulid: ulid_val
        }
    }catch(error){
        throw new Error("Error during encryption: " + error)
    }

}
export function decryptValue(cipherText: string) : string {
    try{
        const buffer = Buffer.from(cipherText, "base64")
        const iv = buffer.subarray(0,12)
        const tag = buffer.subarray(12,28)
        const encryptedText = buffer.subarray(28)
        
        const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv)
        decipher.setAuthTag(tag)
        const plainText = Buffer.concat([decipher.update(encryptedText), decipher.final()])
        return plainText.toString('utf-8')

    }catch(error){
        throw new Error("Error during decryption: " + error)
    }
}