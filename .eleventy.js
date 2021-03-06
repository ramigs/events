const { DateTime } = require('luxon');
const CleanCSS = require('clean-css');
const urlParse = require('url-parse');
const slugify = require('slugify');

module.exports = function (config) {
	config.addCollection('events', function (collection) {
		let allEvents = collection.getFilteredByGlob('site/events/*.md');
		let futureEvents = allEvents.filter((event) => {
			return event.data.date >= new Date();
		});
		return futureEvents;
	});

	config.addCollection('pastevents', function (collection) {
		let allEvents = collection.getFilteredByGlob('site/events/*.md');
		let pastEvents = allEvents.filter((event) => {
			return event.data.date <= new Date();
		});
		return pastEvents;
	});

	config.addCollection('allevents', function (collection) {
		return collection.getFilteredByGlob('site/events/*.md');
	});

	config.addFilter('getEventYears', (events) => {
		let result = events.reduce((years, ev) => {
			let current_year = DateTime.fromJSDate(ev.data.date, {
				zone : 'utc'
			}).year;
			if (years.indexOf(current_year) === -1) {
				years.push(current_year);
			}
			return years;
		}, []);
		result.sort();
		return result;
	});

	config.addFilter('domainRoot', (rootUrl) => {
		let domainObj = urlParse(rootUrl);
		return domainObj.hostname;
	});

	config.addFilter('getMonthName', (dateObj) => {
		return DateTime.fromJSDate(dateObj, {
			zone : 'utc'
		}).toFormat('MMMM');
	});

	config.addFilter('checkDate', (dateObj, month, year) => {
		let current_month = DateTime.fromJSDate(dateObj, {
			zone : 'utc'
		}).toFormat('MMMM');
		let current_year = DateTime.fromJSDate(dateObj, {
			zone : 'utc'
		}).year;
		return current_month === month && current_year === year;
	});

	config.addFilter('doesEventExist', (events, monthToTest, yearToTest) => {
		let length = events.filter((ev) => {
			let month = DateTime.fromJSDate(ev.data.date, {
				zone : 'utc'
			}).toFormat('MMMM');
			let year = DateTime.fromJSDate(ev.data.date, {
				zone : 'utc'
			}).year;
			return month === monthToTest && year === yearToTest;
		}).length;
		return length;
	});

	config.addFilter('readableDate', (dateObj) => {
		return DateTime.fromJSDate(dateObj, {
			zone : 'utc'
		}).toFormat('LLLL d, y');
	});

	config.addFilter('htmlTime', (dateObj) => {
		return DateTime.fromJSDate(dateObj, {
			zone : 'utc'
		}).toFormat('yyyy-MM-dd');
	});

	config.addFilter('cssmin', function (code) {
		return new CleanCSS({}).minify(code).styles;
	});

	// override the slug filter to be more restrictive
	// eg. for confereces with parenthesis or Script'19
	slugify.extend({ "'": '-' }, { '(': '' }, { ')': '' });
	config.addFilter('slug', function (value) {
		return slugify(value, {
			replacement : '-',
			lower       : true
		});
	});

	config.addPassthroughCopy('assets/scripts');
	config.addPassthroughCopy('assets/images');
	config.addPassthroughCopy('site/admin');
	config.addPassthroughCopy('apple-touch-icon.png');
	config.addPassthroughCopy('favicon.ico');

	return {
		dir                    : { input: 'site', output: 'dist', includes: '_includes' },
		passthroughFileCopy    : true,
		templateFormats        : [
			'njk',
			'md',
			'css',
			'js',
			'html',
			'yml'
		],
		htmlTemplateEngine     : 'njk',
		markdownTemplateEngine : 'njk'
	};
};
