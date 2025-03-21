const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos
const db = new sqlite3.Database('clientes.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.serialize(() => {
    // Crear la tabla si no existe
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table "clientes" is ready.');

            // Insertar clientes y después mostrar la lista
            insertClients();
        }
    });
});

// Función para insertar múltiples clientes y luego mostrar la lista
function insertClients() {
    const clients = [
        ['Carlos', 'García', 'carlos@example.com'],
        ['Ana', 'López', 'ana@example.com']
    ];

    let insertedCount = 0; // Contador para saber cuándo terminan los inserts

    clients.forEach((client) => {
        db.run(`INSERT INTO clientes (nombre, apellidos, email) VALUES (?, ?, ?)`, client, function(err) {
            if (err) {
                console.error('Error inserting data:', err.message);
            } else {
                console.log(`Inserted client with ID: ${this.lastID}`);
            }

            insertedCount++;

            // Si ya insertamos todos, mostramos la lista
            if (insertedCount === clients.length) {
                showClients();
            }
        });
    });
}

// Función para mostrar todos los clientes (solo una vez)
function showClients() {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
            return;
        }
        console.log('Client List:');
        rows.forEach((row) => {
            console.log(`${row.id} - ${row.nombre} ${row.apellidos} (${row.email})`);
        });

        // Cerrar la base de datos solo una vez
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}

