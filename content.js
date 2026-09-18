/* Настоящая озвучка: путь к единой аудиодорожке narration (например assets/voice.mp3).
   Время start/end указано в секундах от начала записи. После записи подогнать интервалы.
   Фото: photos: [{ src: 'assets/photo-01.jpg', caption: 'Настоящая подпись' }, ...].
   При отсутствии фото финал показывает вечерний пейзаж, без выдуманных воспоминаний. */
window.STORY_DATA = {
  duration: 116,
  playbackRate: 1.15,
  narration: null,
  photos: [],
  montageStart: 85,
  photoInterval: 1.2,
  envelopeGate: 28,
  envelopeEnd: 37,
  cues: [
    { start: 0, end: 6, scene: 'moment', text: 'Маша × Марк' },
    { start: 6, end: 12, scene: 'moment', text: 'Один месяц.' },
    { start: 12, end: 19, scene: 'moment', text: 'Из маленьких моментов\nскладывается наша история.' },
    { start: 19, end: 25, scene: 'moment', text: 'И столько всего\nещё впереди.' },
    { start: 25, end: 37, scene: 'letters', text: 'Три маленьких сюрприза.' },
    { start: 37, end: 45, scene: 'chess', step: 0, text: 'Иногда мы делаем ходы,\nо которых жалеем.' },
    { start: 45, end: 53, scene: 'chess', step: 1, text: 'Ссоримся. Говорим лишнее.\nНе понимаем друг друга.' },
    { start: 53, end: 60, scene: 'chess', step: 2, text: 'Кажется, что это был\nнеправильный ход.' },
    { start: 60, end: 71, scene: 'chess', step: 3, text: 'Но в шахматах один ход не определяет всю партию.\nОн лишь меняет то, какой будет следующая комбинация.' },
    { start: 71, end: 79, scene: 'chess', step: 4, text: 'В наших отношениях тоже не каждый ход был идеальным.\nНо именно они привели нас сюда.' },
    { start: 79, end: 85, scene: 'chess', step: 5, text: 'Главное — не перестать\nделать следующий ход.' },
    { start: 85, end: 91, scene: 'final', text: 'Маленькие моменты.' },
    { start: 91, end: 97, scene: 'final', text: 'Наша история.' },
    { start: 97, end: 106, scene: 'final', text: 'Впереди ещё много моментов, историй\nи всего того, что мы ещё проживём вместе.' },
    { start: 106, end: 116, scene: 'final', text: 'Это только\nначало.' },
  ],
};
