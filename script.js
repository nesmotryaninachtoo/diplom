const greeting = document.querySelector('.eyebrow');
const today = new Date();
const hour = today.getHours();

const name = 'Екатерина';
let partOfDay = 'Добрый день';

if (hour < 12) {
  partOfDay = 'Доброе утро';
} else if (hour >= 18) {
  partOfDay = 'Добрый вечер';
}

if (greeting) {
  greeting.textContent = `${partOfDay}, ${name}!`;
}

const shortcuts = document.querySelectorAll('.shortcut-tile');
shortcuts.forEach((tile) => {
  tile.addEventListener('click', () => {
    shortcuts.forEach((button) => button.classList.remove('shortcut-tile--selected'));
    tile.classList.add('shortcut-tile--selected');
  });
});
