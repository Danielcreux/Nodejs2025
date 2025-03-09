const http = require('http');

let agenda = [
    {
		"nombre":"Joshue Daniel",
		"apellidos":"Freire Sánchez",
		"email":"info@joshue.com",
		"telefono":123456
	},
	{
		"nombre":"Alberto",
		"apellidos":"Garcia Lopez",
		"email":"Alberto@garcia.com",
		"telefono":123456
	},
];

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/json' });
  respuesta.end("Te doy el json");
  respuesta.end(JSON.stringify(agenda));
});
servidor.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});