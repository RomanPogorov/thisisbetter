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

    // Получение данных изображений
    const imageDataArray = await Promise.all(images.map(getImageData));

    // Отправка изображений в группу
    const captions = descriptions.map(desc => desc ? desc.description : 'No description');
    await sendImagesToGroup(imageDataArray, captions);

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

async function sendImagesToGroup(images, captions) {
    try {
        const media = images.map((image, index) => {
            return {
                type: 'photo',
                media: `attach://image${index}`, // Передаем идентификаторы изображений
                caption: captions[index]
            };
        });

        const form = new FormData();
        form.append('chat_id', chatId);

        images.forEach((image, index) => {
            form.append(`image${index}`, image, { filename: `image${index}.jpg` }); // Прикрепляем изображения
        });

        form.append('media', JSON.stringify(media));

        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        if (response && response.data && response.data.ok) {
            console.log('Images sent to group:', response.data);
        } else {
            console.error('Telegram API returned an error:', response ? response.data.description : 'Unknown error');
        }
    } catch (error) {
        console.error('Error sending images to group:', error.response ? error.response.data : error);
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
