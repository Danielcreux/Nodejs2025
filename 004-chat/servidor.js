const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

var mensajes = [];

const servidor = http.createServer((peticion, respuesta) => {
    const urlcompleta = url.parse(peticion.url, true);
    const ruta = urlcompleta.pathname;
    
    // Configurar CORS
    respuesta.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas las conexiones
    respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos permitidos
    respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Permitir encabezados

    if (ruta === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                respuesta.writeHead(500, { 'Content-Type': 'text/plain' });
                return respuesta.end('Error interno del servidor');
            }
            respuesta.writeHead(200, { 'Content-Type': 'text/html' });
            respuesta.end(content, 'utf-8');
        });
    } else if (ruta === '/envia') {
        console.log("Servidor ha recibido un mensaje");
        if (urlcompleta.query.mensaje) {
            mensajes.push(urlcompleta.query.mensaje);  // Guardar el mensaje recibido
        }
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify({ status: "Mensaje recibido" }));
    } else if (ruta === '/recibe') {
        respuesta.writeHead(200, { 'Content-Type': 'application/json' });
        respuesta.end(JSON.stringify(mensajes));  // Devolver los mensajes en formato JSON
    }
});

servidor.listen(3000, () => {
    console.log(`Server running at http://localhost:3000/`);
});
