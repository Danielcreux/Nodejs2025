const http = require('http');
const fs = require('fs');
const path = require('path');

const servidor = http.createServer((peticion, respuesta) => {
    const url = peticion.url;
    let filePath;

    if (url === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (url === '/contacto') {
        filePath = path.join(__dirname, 'public', 'contacto.html');
    } else if (url === '/sobremi') {
        filePath = path.join(__dirname, 'public', 'sobremi.html');
    } else {
        filePath = path.join(__dirname, 'public', '404.html');
    }

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            respuesta.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
            return respuesta.end('Error interno del servidor');
        }

        respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        respuesta.end(content, 'utf-8');
    });
});

servidor.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
