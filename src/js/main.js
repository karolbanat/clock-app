const clockApp = document.querySelector('#clock-app');
/* elements for quote handling */
const quoteGenerator = document.querySelector('#quote-generator');
const quoteText = quoteGenerator.querySelector('#quote');
const quoteAuthor = quoteGenerator.querySelector('#quote-author');
const refreshQuoteBtn = quoteGenerator.querySelector('button[data-action=quote-refresh]');
/* elements for time and details handling */
const timeIcon = document.querySelector('#time-of-day-icon');
const greetingSpan = document.querySelector('#greeting');
const currentTimeSpan = document.querySelector('#current-time');
const timezoneSpan = document.querySelector('#timezone');
const locationSpan = document.querySelector('#location');
/* details elements */
const toggleTimeDetailsBtn = document.querySelector('button[data-action=toggle-details]');
const timeDetailsContainer = document.querySelector('#time-details');
const detailsTimezone = timeDetailsContainer.querySelector('[data-details=timezone]');
const detailsDayOfTheYear = timeDetailsContainer.querySelector('[data-details=day-of-year]');
const detailsDayOfTheWeek = timeDetailsContainer.querySelector('[data-details=day-of-week]');
const detailsWeekNumber = timeDetailsContainer.querySelector('[data-details=week-number]');

const QUOTE_API_BASE = 'https://programming-quotes-api.herokuapp.com/Quotes';
const IP_API_KEY = 'iMC9RpefbvVTgC7vDIdxLYH14hwAKs9pvi4SEypx';
const IP_API_BASE = 'https://api.ipbase.com/v2';
const REQUEST_LIMIT_HIT_CODE = 429;
const WORLD_TIME_API_BASE = 'http://worldtimeapi.org/api/ip';

const ICON_SUN = './dist/assets/desktop/icon-sun.svg';
const ICON_MOON = './dist/assets/desktop/icon-moon.svg';

/* quote handling */
const getRandomQuote = () => {
	const requestURI = `${QUOTE_API_BASE}/random`;
	fetch(requestURI)
		.then((res) => res.json())
		.then((data) => insertQuote({ quote: data.en, author: data.author }));
};

const insertQuote = ({ quote, author }) => {
	quoteText.innerText = `"${quote}"`;
	quoteAuthor.innerText = author;
};

/* ip info handling */
const getIPInfo = () => {
	const requestURI = `${IP_API_BASE}/info?apikey=${IP_API_KEY}`;
	fetch(requestURI)
		.then((res) => {
			if (res.status === REQUEST_LIMIT_HIT_CODE) throw new Error('Requests limit hit');
			return res.json();
		})
		.then((data) => {
			const { ip, location } = data.data;
			handleIPData({ ip: ip, country: location.country.alpha2, city: location.city.name });
		})
		.catch((error) => {
			// do nothing for now
		});
};

const handleIPData = ({ ip, country, city }) => {
	insertLocation({ country, city });
	getTimeByIP(ip);
};

/* insert location under displaying time */
const insertLocation = ({ country, city }) => {
	locationSpan.innerText = `${city}, ${country}`;
};

/* time handling */
const getTimeByIP = (ip) => {
	const requestURI = `${WORLD_TIME_API_BASE}/${ip}`;
	fetch(requestURI)
		.then((res) => res.json())
		.then((data) => {
			handleTimeData({
				...data,
				dayOfWeek: data.day_of_week,
				dayOfYear: data.day_of_year,
				weekNumber: data.week_number,
			});
		});
};

/* insert data for time, location and details */
const handleTimeData = ({ abbreviation, datetime, dayOfWeek, dayOfYear, weekNumber, timezone }) => {
	const date = new Date(datetime);
	const [hours, minutes] = [date.getHours(), date.getMinutes()];
	insertGreeting(hours);
	handleIcon(hours);
	handleBackgroundImage(hours);
	currentTimeSpan.innerText = `${hours}:${minutes}`;
	timezoneSpan.innerText = abbreviation;
	detailsTimezone.innerText = timezone;
	detailsDayOfTheYear.innerText = dayOfYear;
	detailsDayOfTheWeek.innerText = dayOfWeek;
	detailsWeekNumber.innerText = weekNumber;
};

/* set greeting depending on the time of the day */
const insertGreeting = (hours) => {
	const timeOfDay = hours >= 5 && hours < 12 ? 'morning' : hours >= 12 && hours < 18 ? 'afternoon' : 'evening';
	greetingSpan.innerText = timeOfDay;
};

/* set icon depending on the time of the day */
const handleIcon = (hours) => {
	const iconSource = isDay(hours) ? ICON_SUN : ICON_MOON;
	timeIcon.src = iconSource;
};

/* set background depending on the time of the day */
const handleBackgroundImage = (hours) => {
	const time = isDay() ? 'daytime' : 'nighttime';
	document.body.dataset.time = time;
};

const isDay = (hours) => {
	return hours >= 5 && hours < 18;
};

/* toggling details handler */
const handleDetailsToggle = () => {
	toggleTimeDetailsBtn.toggleAttribute('data-expanded');
	const isExpanded = toggleTimeDetailsBtn.hasAttribute('data-expanded');
	quoteGenerator.toggleAttribute('data-hidden', isExpanded);
	toggleTimeDetailsBtn.setAttribute('aria-expanded', isExpanded);
	timeDetailsContainer.toggleAttribute('data-visible', isExpanded);
	timeDetailsContainer.classList.add('animation-scale-up');
	clockApp.dataset.mode = isExpanded ? 'details' : 'display';
};

/* event listeners */
refreshQuoteBtn.addEventListener('click', getRandomQuote);
toggleTimeDetailsBtn.addEventListener('click', handleDetailsToggle);

/*  */
getRandomQuote();
getIPInfo();
