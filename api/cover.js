// api/cover.js
// Questo è il proxy che aggira le restrizioni CORS per la copertina

export default async function handler(req, res) {
    const imageUrl = "https://play.radiocharlie.it/CoverMBStudio/OnAir.jpg";
  
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
  
      // Imposta i tipi di contenuto e headers per l'immagine
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); // No cache forte
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
  
      // Invia lo stream dell'immagine direttamente al client
      response.body.pipeTo(res.writable);
  
    } catch (error) {
      console.error("Error fetching cover image:", error);
      // In caso di errore, reindirizza a un'immagine di fallback generica
      res.redirect(302, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop');
    }
  }