const express = require('express'); // Подключаем библиотеку Express.js
const bodyParser = require('body-parser'); // Подключаем middleware для парсинга JSON
const cors = require('cors'); // Подключаем middleware для обработки CORS

// Импортируем функции для работы с Telegram Bot из отдельного файла
const { getImageData, sendImagesToGroup, createPollInGroup } = require('./telegramBot');

const app = express(); // Создаем экземпляр приложения Express
const port = 3000; // Указываем порт, на котором будет работать сервер

app.use(bodyParser.json()); // Используем middleware для парсинга JSON в телах запросов
app.use(cors()); // Используем middleware для обработки CORS (Cross-Origin Resource Sharing)

// Обрабатываем POST запрос на эндпоинт '/send-data'
app.post('/send-data', async (req, res) => {
    const { images, descriptions } = req.body; // Извлекаем из тела запроса массивы изображений и описаний
    console.log('Received request to /send-data:', req.body); // Выводим в консоль полученные данные

    try {
        // Получаем данные изображений и описаний асинхронно и параллельно
        const imageDataArray = await Promise.all(images.map(getImageData));
        
        // Формируем массив описаний, если описание отсутствует, используем 'No description'
        const captions = descriptions.map(desc => desc ? desc.description : 'No description');
        
        // Отправляем изображения в группу Telegram
        await sendImagesToGroup(imageDataArray, captions);
        
        // Создаем опрос в группе Telegram
        const options = descriptions.map(desc => desc.description);
        await createPollInGroup('Which image is better?', options);
        
        // Отправляем успешный ответ об успешной обработке данных
        res.send('Data received and processed successfully!');
    } catch (error) {
        // Если возникла ошибка, выводим ее в консоль и отправляем клиенту ответ с кодом ошибки 500
        console.error('Error processing request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Запускаем сервер на указанном порту
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
