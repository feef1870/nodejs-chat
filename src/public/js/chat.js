console.log("Chat.js loaded");


const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const clearBtn = document.getElementById('clearMessagesBtn');
const logoutBtn = document.getElementById('logoutButton');

if (!form || !messagesList || !input) {
    console.warn("Chat elements not found");
}
else {

    //Connect to Socket.io server
    const socket = io();

    form.addEventListener('submit', (e) => {
        e.preventDefault(); //Do not refresh the page

        const text = input.value.trim();
        if (!text) return;

        //Send message to server
        socket.emit('sendMessage', { text });

        input.value = '';
    });


    //Get new message from server
    socket.on('newMessage', (msg) => {
        addMessage(msg);
    });

    socket.on('clearChat', () => {
        document.getElementById('messages').innerHTML = '';
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            const confirmClear = confirm('Are you sure you want to clear the chat?');
            if (!confirmClear) return;

            const res = await fetch('/chat/clear', {
                method: 'POST',
            });
        });
    }
}



function addMessage(msg) {
    const messages = document.getElementById('messages');
    const li = document.createElement('li');

    if (Number(msg.userId) === CURRENT_USER_ID) {
        li.classList.add('my-message');
    }
    else {
        li.classList.add('other-message');
    }

    const strong = document.createElement('strong');
    strong.textContent = msg.username + ': ';

    const textNode = document.createTextNode(msg.text);

    li.appendChild(strong);
    li.appendChild(textNode);

    messages.appendChild(li);

    scrollToBottom();
}

function scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    container.scrollTop = container.scrollHeight;
}




