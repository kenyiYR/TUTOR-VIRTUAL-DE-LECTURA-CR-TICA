import supabase from './supabase.js';

/**
 * Sube un archivo (Buffer) a Supabase Storage.
 *
 * @param {Object} params
 * @param {string} params.bucket
 * @param {string} params.path
 * @param {Buffer} params.buffer
 * @param {string} params.contentType
 * @returns {Promise<string>} path interno del bucket
 */
export async function uploadBuffer({ bucket, path, buffer, contentType }) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  // data.path es la ruta interna dentro del bucket
  return data.path;
}

/**
 * Obtiene la URL pública de un archivo en Supabase Storage.
 *
 * @param {Object} params
 * @param {string} params.bucket
 * @param {string} params.path
 * @returns {string} URL pública
 */
export function publicUrl({ bucket, path }) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Descarga un archivo del storage de Supabase como Buffer.
 *
 * Esto es lo que usamos para:
 *   - Bajar el PDF de la lectura
 *   - Pasarlo a pdf-parse para extraer texto
 *
 * @param {Object} params
 * @param {string} params.bucket
 * @param {string} params.path
 * @returns {Promise<Buffer>}
 */
export async function downloadFileToBuffer({ bucket, path }) {
  if (!bucket || !path) {
    throw new Error('Bucket y path son requeridos para descargar archivo.');
  }

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(
      `Error descargando archivo de Supabase (bucket=${bucket}, path=${path}): ${error.message}`
    );
  }

  if (!data || typeof data.arrayBuffer !== 'function') {
    throw new Error('Respuesta inesperada al descargar archivo desde Supabase.');
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
