// cliente.js

// Global Variables
let usuario = "";            // Current user's username
let userId = "";             // Current user's unique ID
let currentRoom = "global";  // Default chat room
let temporizador;            // Timer for fetching messages

// Utility Function: Convert a string to a color hue (0-360)
function stringToMod360(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Function: Register or Reconnect the user
function registerOrReconnectUser() {
  const storedUserId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');

  if (storedUserId && storedUsername) {
    console.log('Attempting to reconnect with stored userId and username...');
    fetch(`http://217.154.6.203:3000/register?username=${encodeURIComponent(storedUsername)}&userId=${encodeURIComponent(storedUserId)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Reconnection failed:', data.error);
          promptForUsername();
        } else {
          usuario = data.username;
          userId = data.id;
          console.log(`Reconnected as ${usuario} with ID ${userId}`);
          loadUserList();
          startReceiving();
        }
      })
      .catch(err => {
        console.error('Error during reconnection:', err);
        promptForUsername();
      });
  } else {
    promptForUsername();
  }
}

// Function: Prompt the user to enter a username
function promptForUsername() {
  usuario = prompt("Por favor, ingresa tu nombre de usuario:");

  if (usuario) {
    fetch(`http://217.154.6.203:3000/register?username=${encodeURIComponent(usuario)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          promptForUsername();
        } else {
          usuario = data.username;
          userId = data.id;
          localStorage.setItem('userId', userId);
          localStorage.setItem('username', usuario);
          console.log(`Registered as ${usuario} with ID ${userId}`);
          loadUserList();
          startReceiving();
        }
      })
      .catch(err => {
        console.error('Error registering user:', err);
        alert("Error al registrar el usuario. Inténtalo de nuevo.");
        promptForUsername();
      });
  } else {
    promptForUsername();
  }
}

// Function: Load and display the user list
function loadUserList() {
  fetch('http://217.154.6.203:3000/users')
    .then(response => response.json())
    .then(data => {
      const usuariosUl = document.getElementById('usuarios');
      usuariosUl.innerHTML = '<li><a href="#" data-room="global">Sala Global</a></li>';

      data.forEach(user => {
        if (user.username !== usuario) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = "#";
          a.textContent = user.username;
          a.dataset.room = `private_${sortedRoomId(userId, user.id)}`;
          li.appendChild(a);
          usuariosUl.appendChild(li);
        }
      });
    })
    .catch(err => {
      console.error('Error fetching user list:', err);
    });
}

// Function: Generate a sorted room ID for private chats
function sortedRoomId(id1, id2) {
  return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
}

// Event Listener: Handle clicks on the user list to switch rooms
document.getElementById('usuarios').addEventListener('click', function(event) {
  event.preventDefault();
  if (event.target.tagName === 'A') {
    const clickedUsername = event.target.textContent;
    const room = event.target.dataset.room;
    currentRoom = room;

    if (room === 'global') {
      document.getElementById('current-room').textContent = 'Sala Global';
    } else {
      document.getElementById('current-room').textContent = `Chat Privado con ${clickedUsername}`;
    }

    document.getElementById('mensajes').innerHTML = "";
    recibe();
  }
});

// Function: Send a message
function enviarMensaje() {
  let mensajeInput = document.querySelector("#mensaje");
  let mensaje = mensajeInput.value.trim();

  if (!mensaje) return;
  mensajeInput.value = "";

  let room = currentRoom;

  console.log(`Sending message to room: ${room}`);

  fetch(
    `http://217.154.6.203:3000/envia?mensaje=${encodeURIComponent(mensaje)}&usuario=${encodeURIComponent(usuario)}&room=${encodeURIComponent(room)}`
  )
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Error sending message:', data.error);
      alert("Error al enviar el mensaje.");
    }
  })
  .catch(err => {
    console.error('Error sending message:', err);
    alert("Error al enviar el mensaje.");
  });
}

// Event Listener: Handle click on the send button
document.querySelector("#enviar").onclick = enviarMensaje;

// Event Listener: Handle "Enter" key press in the message input
document.querySelector("#mensaje").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    enviarMensaje();
  }
});

// Function: Fetch and display messages for the current room
function recibe() {
  console.log(`Fetching messages from room: ${currentRoom}`);

  fetch(`http://217.154.6.203:3000/recibe?room=${encodeURIComponent(currentRoom)}`)
    .then((response) => response.json())
    .then((datos) => {
      let mensajesDiv = document.querySelector("#mensajes");
      mensajesDiv.innerHTML = "";

      datos.forEach((dato) => {
        let articulo = document.createElement("article");
        let cabecera = document.createElement("h6");

        const fecha = new Date(dato.fecha);
        cabecera.textContent = `${fecha.toLocaleString()} - ${dato.usuario}:`;
        articulo.appendChild(cabecera);

        let parrafo = document.createElement("p");
        parrafo.textContent = dato.mensaje;
        articulo.appendChild(parrafo);

        articulo.style.background = `hsl(${stringToMod360(dato.usuario)}deg, 50%, 90%)`;

        mensajesDiv.appendChild(articulo);
      });

      mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
    })
    .catch(err => {
      console.error('Error fetching messages:', err);
    });

  clearTimeout(temporizador);
  temporizador = setTimeout(recibe, 1000);
}

// Function: Start receiving messages
function startReceiving() {
  temporizador = setTimeout(recibe, 1000);
}

// Emoji Selector Functionality
document.querySelector("#emoji").onclick = function () {
  let emojiContainer = document.querySelector("#emojis");
  emojiContainer.style.display =
    emojiContainer.style.display === "block" ? "none" : "block";
};

document.getElementById("emojis").addEventListener("click", function (event) {
  const emoji = event.target.textContent;

  if (event.target.tagName === "SPAN") {
    document.querySelector("#mensaje").value += emoji;
    document.querySelector("#emojis").style.display = "none";
  }
});

// Periodically update the user list (optional)
setInterval(loadUserList, 5000);

// Initialize the chat application when the page loads
window.onload = function() {
  registerOrReconnectUser();
};


