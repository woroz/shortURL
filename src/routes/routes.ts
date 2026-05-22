import { Router, Request, Response } from 'express';
import { createUrls, getLongUrl, getUrls, incrementarClicks, getUrlByShort, deleteUrl, updateAlias} from '../database/bd';
import { validarURL } from '../utils/validation';
import { createShortUrL } from '../utils/shortener';
import { obtenerMetaDatos } from '../utils/obtenermd'
import { convert } from '../utils/convert';
import { generarIdUnico } from '../utils/idUnico'

const router = Router();

router.route('/stats').get(async (req: Request, res: Response) => {
    const idUsuario = req.cookies.userId
    if (!idUsuario) {
        res.redirect('/')
        return
    }
    
    try {
        const urls = await getUrls(idUsuario)
        const totalClicks = urls.reduce((sum, url) => sum + (Number(url.clicks) || 0), 0)
        res.render('stats', { urls, totalClicks })
    } catch (error) {
        res.status(500).send('Error al obtener las estadisticas')
    }
})

router.route('/stats/:shortUrl').get(async (req: Request, res: Response) => {
    const { shortUrl } = req.params
    const idUsuario = req.cookies.userId
    if (!idUsuario)  {
        res.redirect('/') 
        return
    }
    try {
        const url = await getUrlByShort(shortUrl)
        if (!url){
            res.status(404).send('No encontrada')
            return
        }
        res.render('stats-detail', { url })
    } catch {
        res.status(500).send('Error al obtener las estadisticas')
    }

})

router.route('/mis-url').get(async (req: Request, res: Response) => {
    const idUsuario = req.cookies.userId
    try {
        const urls = await getUrls(idUsuario)
        res.render('example', { title: 'Mis URLs', urls, message: '' })
    } catch (error) {
        res.status(500).send('Error al obtener las URLs')
    }
})

router.route('/url').get(async (req: Request, res: Response) => {
    const urls = await getUrls(req.cookies.userId)
    res.render('example', { title: 'Short URL', shortUrl: null, urls, message: '' })
})

router.route('/url').post(async (req: Request, res: Response) => {
    const { longUrl, customAlias } = req.body
    let idUsuario = req.cookies.userId

    if (!idUsuario) {
        idUsuario = generarIdUnico()
        res.cookie('userId', idUsuario, {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            secure: false,
        })
    }

    try {
        if (!validarURL(longUrl)) {
            res.status(400).json({ error: 'La URL proporcionada no es válida.' })
            return
        }

        const urlConvertida = convert(longUrl)
        const shortUrl = createShortUrL(longUrl, customAlias, idUsuario)
        const existingUrl = await getLongUrl(shortUrl)

        if (existingUrl) {
            res.status(400).json({ error: 'El alias ya esta en uso, elege otro.' })
            return
        }

        const metaDatos = await obtenerMetaDatos(urlConvertida)
        await createUrls(idUsuario, shortUrl, urlConvertida, metaDatos?.titulo, metaDatos?.descripcion, metaDatos?.imagen)
        const urls = await getUrls(idUsuario)
        res.json({
            shortUrl,
            longUrl: urlConvertida,
            titulo: metaDatos?.titulo ?? null,
            descripcion: metaDatos?.descripcion ?? null,
            imagen: metaDatos?.imagen ?? null,
        })
    } catch (error) {
        console.log('Error en POST /url:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.route('/url/:shortUrl').delete(async (req: Request, res: Response) => {
  const idUsuario = req.cookies.userId
  if (!idUsuario) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }
  try {
    await deleteUrl(req.params.shortUrl, idUsuario)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

router.route('/url/:shortUrl').patch(async (req: Request, res: Response) => {
  const idUsuario = req.cookies.userId
  const { newAlias } = req.body
  if (!idUsuario) {
    res.status(401).json({ error: 'No autorizado' })
    return
}
  try {
    await updateAlias(req.params.shortUrl, newAlias, idUsuario)
    res.json({ ok: true, newAlias })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.route('/:shortUrl').get(async (req: Request, res: Response) => {
    const { shortUrl } = req.params
    try {
        const urlOriginal = await getLongUrl(shortUrl)

        if (!urlOriginal) {
            res.status(404).send('URL no encontrada')
            return
        }
        await incrementarClicks(shortUrl)
        res.redirect(urlOriginal)
    } catch (error) {
        res.status(500).send('Error interno del servidor')
    }
})

export default router