import CryptoJS from "crypto-js";
import { ivString, key } from "../env";

const iv = CryptoJS.enc.Utf8.parse(ivString);
const parsedKey = CryptoJS.enc.Utf8.parse(key);  // <- Esto es CLAVE

export const encrypt = (pass: string) => {
    return CryptoJS.AES.encrypt(pass, parsedKey, { iv }).toString();
}

export const decrypt = (encryptedPass: string) => {
    return CryptoJS.AES.decrypt(encryptedPass, parsedKey, { iv }).toString(CryptoJS.enc.Utf8);
}
