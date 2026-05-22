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
  try {
    await db.execute(`ALTER TABLE urls ADD COLUMN clicks INTEGER DEFAULT 0`)
  } catch (e) {
  }

  console.log('DB inicializada')
}

export async function createUrls(idUsuario: string, shortUrl: string, longUrl: string, titulo?: string, descripcion?: string, imagen?: string) {
  const existing = await db.execute({
    sql: `SELECT * FROM urls WHERE shortUrl = ? AND IdUsuario = ?`,
    args: [shortUrl, idUsuario]
  })
  if (existing.rows.length > 0) throw new Error('Este alias ya esta en uso, elige otro.')

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

export async function deleteUrl(shortUrl: string, IdUsuario: string) {
  await db.execute({
    sql: `DELETE FROM urls WHERE shortUrl = ? AND IdUsuario = ?`,
    args: [shortUrl, IdUsuario]
  })
}

export async function updateAlias(shortUrl: string, newAlias: string, IdUsuario: string) {
  const existing = await db.execute({
    sql: `SELECT * FROM urls WHERE shortUrl = ? AND IdUsuario = ?`,
    args: [newAlias, IdUsuario]
  })
  if (existing.rows.length > 0) throw new Error('El alias ya esta en uso, elege otro.')
  
  await db.execute({
    sql: `UPDATE urls SET shortUrl = ? WHERE shortUrl = ? AND IdUsuario = ?`,
    args: [newAlias, shortUrl, IdUsuario]
  })
}

export async function incrementarClicks(shortUrl: string) {
  await db.execute({
    sql: `UPDATE urls SET clicks = clicks + 1 WHERE shortUrl = ?`,
    args: [shortUrl]
  })
}

export async function getUrlByShort(shortUrl: string) {
  const result = await db.execute({
    sql: `SELECT * FROM urls WHERE shortUrl = ?`,
    args: [shortUrl]
  })
  return result.rows[0] ?? null
}