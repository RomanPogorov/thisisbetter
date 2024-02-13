const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const port = 3000;

const botToken = '6897510486:AAFCzdJ7IM-Q0fUe1tNq93MKD95CYU-80QA'; // Замените на токен вашего бота
const chatId = '-1002046538593'; // Замените на ID вашей группы

app.use(bodyParser.json());
app.use(cors());

app.post('/send-data', async (req, res) => {
    console.log('Received request to /send-data:', req.body);
    const { images, descriptions } = req.body;

    // Отправка изображений в группу
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageData = await getImageData(image); // Получаем данные изображения

        if (imageData) {
            const caption = descriptions[i] ? descriptions[i].description : 'No description';
            await sendImageToGroup(imageData, caption);
        }
    }

    // Создание опроса
    const options = descriptions.map(desc => desc.description);
    createPollInGroup('Which image is better?', options);

    res.send('Data received and processed successfully!');
});

async function getImageData(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary'); // Преобразуем данные изображения в буфер
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

async function sendImageToGroup(imageData, caption) {
    try {
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', imageData, { filename: 'image.jpg' }); // Отправляем изображение в виде файла
        form.append('caption', caption);

        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
            headers: {
                ...form.getHeaders(), // Получаем заголовки формы
            },
        });

        if (response.data.ok) {
            console.log('Image sent to group:', response.data);
        } else {
            console.error('Telegram API returned an error:', response.data.description);
        }
    } catch (error) {
        console.error('Error sending image to group:', error.response ? error.response.data : error);
    }
}

async function createPollInGroup(pollQuestion, options) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPoll`, {
            chat_id: chatId,
            question: pollQuestion,
            options: JSON.stringify(options),
        });

        if (response.data.ok) {
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
