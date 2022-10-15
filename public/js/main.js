const socket = io();

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//JOIN chatroom
socket.emit("joinRoom", { username, room });

//Get Room and users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Message from server
socket.on("message", (msg) => {
  console.log(msg);
  outputMessage(msg);

  //Scroll  into view
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Sending message to ther server
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = ` <p class="meta">
                        ${msg.username} <span>${msg.time}</span>
                    </p>
                    <p class="text">
                        ${msg.text}
                    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = users.map((u) => `<li>${u.username}</li>`).join("");
}
