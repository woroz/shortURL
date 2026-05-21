import db from './database'

const urlTable = `
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario TEXT NOT NULL,
    shortUrl TEXT NOT NULL,
    longUrl TEXT NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    imagen TEXT
  )
`

export async function initDB() {
  await db.execute(urlTable)
  console.log('DB inicializada')
}

export async function createUrls(idUsuario: string, shortUrl: string, longUrl: string, titulo?: string, descripcion?: string, imagen?: string) {
  const existing = await db.execute({
    sql: `SELECT * FROM urls WHERE shortUrl = ?`,
    args: [shortUrl]
  })
  if (existing.rows.length > 0) throw new Error('El shortUrl ya está en uso, elige otro.')

  const result = await db.execute({
    sql: `INSERT INTO urls (IdUsuario, shortUrl, longUrl, titulo, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [idUsuario, shortUrl, longUrl, titulo ?? null, descripcion ?? null, imagen ?? null]
  })
  return { id: result.lastInsertRowid, idUsuario, shortUrl, longUrl, titulo, descripcion, imagen }
}

export async function getLongUrl(shortUrl: string): Promise<string | null> {
  const result = await db.execute({
    sql: `SELECT longUrl FROM urls WHERE shortUrl = ?`,
    args: [shortUrl]
  })
  return (result.rows[0]?.longUrl as string) ?? null
}

export async function getUrls(IdUsuario: string) {
  if (!IdUsuario) return [] 
  const result = await db.execute({
    sql: `SELECT * FROM urls WHERE IdUsuario = ?`,
    args: [IdUsuario]
  })
  return result.rows
}

export async function borrarbd() {
  await db.execute(`DROP TABLE IF EXISTS urls`)
  console.log('Tabla borrada con éxito')
}