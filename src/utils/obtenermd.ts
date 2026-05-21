import axios from 'axios'
import * as cheerio from 'cheerio'

export interface Metadatos {
    titulo: string | undefined
    descripcion: string | undefined
    imagen: string | undefined
    url: string
}

export async function obtenerMetaDatos(url: string): Promise<Metadatos | undefined> {
    if (!url) {
        console.log(`La URL proporcionada no es válida: ${url}`)
        return undefined
    }
    try {
        
        const { data, headers } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } })

        // Verifica si el contenido es HTML
        if (!headers['content-type']?.includes('text/html')) {
            console.log(`El contenido de la URL no es HTML`)
            return undefined
        }
        //extrae el html de la url
        const $ = cheerio.load(data)
        const metaRefresh = $('meta[http-equiv="refresh"]').attr('content')
        if (metaRefresh) {
        // intentamos obtener el valor después de 'url='
        const redireccion = metaRefresh.split('url=')[1]

        // verifica si redireccion es un valor valido antes de hacer trim
        if (redireccion) {
            console.log('Redireccion nueva:', redireccion.trim())
            return obtenerMetaDatos(redireccion.trim())  // llamamos a la función con el valor válido
        } else {
            console.log('No se encontró una URL de redirección válida en el meta refresh.')
            return undefined
        }
    }
    const metaDatos: Metadatos = {
        titulo: $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            $('meta[name="title"]').attr('content') ||
            undefined,
        descripcion: $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            undefined,
        imagen: $('meta[property="og:image"]').attr('content') ||
            $('meta[name="image"]').attr('content') ||
            undefined,
        url,
    };

        return metaDatos;
    } catch (error) {
        console.error('Error al obtener los metadatos:', error)
        return undefined
    }
}

