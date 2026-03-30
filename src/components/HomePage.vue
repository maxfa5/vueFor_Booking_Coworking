<template>
  <div class="home-page">
    <h1>Добро пожаловать в Coworking Booking</h1>
    <p>Удобный сервис для бронирования коворкингов и управления рабочими пространствами.</p>

    <section class="news-section">
      <h2>Новости и обновления</h2>
      <div class="news-list">
        <article v-for="news in newsList" :key="news.id" class="news-item">
          <h3>{{ news.title }}</h3>
          <div class="news-meta">
            <span class="date">{{ formatDate(news.date) }}</span>
            <span v-if="news.author" class="author">{{ news.author }}</span>
          </div>
          <p>{{ news.content }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // Пример данных новостей. В реальном проекте их нужно получать из API.
      newsList: [
        {
          id: 1,
          title: 'Открытие нового коворкинга в центре города',
          date: '2025-03-25',
          author: 'Администрация',
          content: 'Мы рады сообщить об открытии нового коворкинга по адресу ул. Ленина, 10. Теперь у вас ещё больше возможностей для комфортной работы!'
        },
        {
          id: 2,
          title: 'Обновление системы бронирования',
          date: '2025-03-20',
          author: 'Техподдержка',
          content: 'Внедрена новая функция: теперь вы можете создавать повторяющиеся бронирования (ежедневно, еженедельно). Подробности в личном кабинете.'
        },
        {
          id: 3,
          title: 'Акция: первые 3 часа бесплатно',
          date: '2025-03-15',
          author: 'Маркетинг',
          content: 'Для новых пользователей действует специальное предложение — первые 3 часа аренды коворкинга абсолютно бесплатно. Успейте воспользоваться!'
        }
      ]
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
  }
};
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.news-section {
  margin-top: 40px;
}

.news-section h2 {
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  transition: box-shadow 0.2s;
}

.news-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.news-item h3 {
  margin: 0 0 8px 0;
  color: #2980b9;
}

.news-meta {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 12px;
  display: flex;
  gap: 15px;
}



.news-item p {
  margin: 0;
  line-height: 1.5;
  color: #34495e;
}
</style>