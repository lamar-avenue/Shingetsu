/* Настоящая озвучка: путь к единой аудиодорожке narration (например assets/voice.mp3).
   Время start/end указано в секундах от начала записи. После записи подогнать интервалы.
   Фото: photos: [{ src: 'assets/photo-01.jpg', caption: 'Настоящая подпись' }, ...].
   При отсутствии фото финал показывает вечерний пейзаж, без выдуманных воспоминаний. */
window.STORY_DATA = {
  duration: 116,
  playbackRate: 1.15,
  narration: null,
  photos: [],
  montageStart: 73,
  photoInterval: 1.2,
  envelopeGate: 107,
  envelopeEnd: 116,
  cues: [
    { start: 0, end: 6, scene: 'moment', text: 'Маша × Марк' },
    { start: 6, end: 12, scene: 'moment', text: 'Один месяц.' },
    { start: 12, end: 19, scene: 'moment', text: 'Из маленьких моментов\nскладывается наша история.' },
    { start: 19, end: 25, scene: 'moment', text: 'И столько всего\nещё впереди.' },
    { start: 25, end: 29, scene: 'chess', step: 0, text: 'Иногда мы делаем ходы,' },
    { start: 29, end: 33, scene: 'chess', step: 1, text: 'о которых жалеем.' },
    { start: 33, end: 37, scene: 'chess', step: 2, text: 'Ссоримся. Говорим лишнее.' },
    { start: 37, end: 41, scene: 'chess', step: 3, text: 'Не понимаем друг друга.' },
    { start: 41, end: 44.5, scene: 'chess', step: 4, text: 'Кажется, что это был' },
    { start: 44.5, end: 48, scene: 'chess', step: 5, text: 'неправильный ход.' },
    { start: 48, end: 53.5, scene: 'chess', step: 6, text: 'Но в шахматах один ход не определяет всю партию.' },
    { start: 53.5, end: 59, scene: 'chess', step: 7, text: 'Он лишь меняет то, какой будет следующая комбинация.' },
    { start: 59, end: 63, scene: 'chess', step: 8, text: 'В наших отношениях тоже не каждый ход был идеальным.' },
    { start: 63, end: 67, scene: 'chess', step: 9, text: 'Но именно они привели нас сюда.' },
    { start: 67, end: 70, scene: 'chess', step: 10, text: 'Главное — не перестать' },
    { start: 70, end: 73, scene: 'chess', step: 11, text: 'делать следующий ход.' },
    { start: 73, end: 79, scene: 'final', text: 'Маленькие моменты.' },
    { start: 79, end: 85, scene: 'final', text: 'Наша история.' },
    { start: 85, end: 94, scene: 'final', text: 'Впереди ещё много моментов, историй\nи всего того, что мы ещё проживём вместе.' },
    { start: 94, end: 104, scene: 'final', text: 'Это только\nначало.' },
    { start: 104, end: 116, scene: 'letters', text: 'Три маленьких сюрприза.' },
  ],
};
