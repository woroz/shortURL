//creo una funcion para crear la url corta
import crypto from 'crypto';

export function createShortUrL(longUrl:string, customAlias:string, idUsuario:string) : string {
    //creo un hash a partir de la url larga
    if (customAlias && customAlias.trim() !== '') {
        return customAlias;
    }
    const hash = crypto.createHash('sha256')
    hash.update(longUrl + idUsuario)
    const shortUrl = hash.digest('hex').slice(0, 6)
    return shortUrl
}