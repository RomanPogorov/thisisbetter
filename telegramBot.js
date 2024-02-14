// Импорт необходимых модулей: axios для выполнения HTTP-запросов и FormData для создания тел запросов multipart/form-data.
const axios = require('axios');
const FormData = require('form-data');

// Объявление констант: токен бота и ID чата, используемых для взаимодействия с API Telegram.
const botToken = '6897510486:AAFCzdJ7IM-Q0fUe1tNq93MKD95CYU-80QA'; // Замените на ваш токен
const chatId = '-1002046538593'; // Замените на ваш ID чата

// Функция для получения данных изображения по URL. Использует бинарный ответ для последующего преобразования в буфер.
async function getImageData(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary'); // Преобразование бинарных данных в буфер
    } catch (error) {
        console.error('Error fetching image:', error); // Логирование ошибки, если запрос не удался
        return null;
    }
}

// Функция для отправки массива изображений в группу Telegram. Изображения отправляются как медиагруппа.
async function sendImagesToGroup(images, captions) {
    try {
        // Формирование массива объектов медиа для отправки, включая тип, медиа и подпись к каждому изображению.
        const media = images.map((image, index) => ({
            type: 'photo',
            media: `attach://image${index}`,
            caption: captions[index]
        }));

        // Создание объекта FormData для отправки данных формы, включая chat_id и медиа.
        const form = new FormData();
        form.append('chat_id', chatId);

        // Добавление каждого изображения как часть формы с уникальным ключом.
        images.forEach((image, index) => {
            form.append(`image${index}`, image, { filename: `image${index}.jpg` });
        });

        // Добавление сериализованного массива медиа как строки.
        form.append('media', JSON.stringify(media));

        // Отправка запроса к API Telegram для публикации медиагруппы.
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, form, {
            headers: { ...form.getHeaders() }, // Добавление необходимых заголовков для multipart/form-data
        });

        // Проверка успешности отправки сообщений.
        if (response.data.ok) {
            console.log('Images sent to group successfully.');
        } else {
            console.error('Failed to send images to group:', response.data.description);
        }
    } catch (error) {
        console.error('Error sending images to group:', error.message); // Логирование ошибки отправки
    }
}

// Функция для создания опроса в группе Telegram с заданным вопросом и вариантами ответов.
async function createPollInGroup(pollQuestion, options) {
    try {
        // Отправка запроса на создание опроса с указанием ID чата, вопроса и вариантов ответов.
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendPoll`, {
            chat_id: chatId,
            question: pollQuestion,
            options: JSON.stringify(options), // Сериализация массива вариантов ответов в строку JSON
        });

        // Проверка успешности создания опроса.
        if (response.data.ok) {
            console.log('Poll created in group successfully.');
        } else {
            console.error('Failed to create poll in group:', response.data.description);
        }
    } catch (error) {
        console.error('Error creating poll in group:', error.message); // Логирование ошибки создания опроса
    }
}

// Экспорт функций для использования в других частях приложения.
module.exports = { getImageData, sendImagesToGroup, createPollInGroup };
