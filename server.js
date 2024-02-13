const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors'); // Импортируем пакет cors

const app = express();
const port = 3000;

// Замените на токен вашего бота и ID вашей группы
const botToken = '6897510486:AAFCzdJ7IM-Q0fUe1tNq93MKD95CYU-80QA';
const chatId = '-1002046538593';

app.use(bodyParser.json());

// Используем cors для разрешения CORS запросов
app.use(cors()); // Это разрешит все CORS запросы

app.post('/send-data', (req, res) => {
    console.log('Received request to /send-data:', req.body); // Выводим тело запроса в консоль
    const { images, descriptions } = req.body;

    // Отправка изображений в группу
    images.forEach(image => {
        sendImageToGroup(image, chatId, botToken);
    });

    // Создание опроса
    const options = descriptions.map(desc => desc.description);
    createPollInGroup('Which image is better?', options, chatId, botToken);

    res.send('Data received and processed successfully!');
});

async function sendImageToGroup(imageUrl, chatId, botToken) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            chat_id: chatId,
            photo: imageUrl,
            caption: 'Choose the best one!'
        });
        if(response.data.ok) {
            console.log('Image sent to group:', response.data);
        } else {
            console.error('Telegram API returned an error:', response.data.description);
        }
    } catch (error) {
        console.error('Error sending image to group:', error.response ? error.response.data : error);
    }
}

async function createPollInGroup(pollQuestion, options, chatId, botToken) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPoll`, {
            chat_id: chatId,
            question: pollQuestion,
            options: JSON.stringify(options),
        });
        if(response.data.ok) {
            console.log('Poll created in group:', response.data);
        } else {
            console.error('Telegram API returned an error:', response.data.description);
        }
    } catch (error) {
        console.error('Error creating poll in group:', error.response ? error.response.data : error);
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
