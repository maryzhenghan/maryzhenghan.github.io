const OPENWEATHER_SEARCH_URL = 'https://api.openweathermap.org/data/2.5/weather';
const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/photos/random/';
let map;

function restartButton() {
	$('.js-restartbutton').on('click', function(event){
		event.preventDefault();

		$('.js-locationpage').removeClass("hidden");
		$('.js-resultspage').addClass("hidden");
	});
}

function changeBg(unsplashData) {
	const unsplashBgUrl = unsplashData.urls.full;
	$('html').css("background", `url('${unsplashBgUrl}') no-repeat center center fixed`);
	$('html').css("background-size", "cover");

	const unsplashUser = unsplashData.user.username;
	const unsplashName = unsplashData.user.name;
	$('.js-unsplashattr').html(`<a href="https://unsplash.com/@${unsplashUser}?utm_source=weatherVaneByMaryHan&utm_medium=referral" target="_blank" class="js-unsplashattr-artist unsplash-attr">${unsplashName}</a>`);
}

function getUnsplashData(weatherIcon, callback) {
	const weatherPhotoSearch = weatherBank[weatherIcon].weatherPhotoSearch;
	const query = {
		query: weatherPhotoSearch,
		orientation: 'landscape',
		featured: '',
		w: 1920,
		client_id: '18f4244f98bfff352004a8687212d4a90fc64ad55bfa3402e323e10f9041ec22',
	}

	$.getJSON(UNSPLASH_SEARCH_URL, query, callback);
}

function displayMap(locationLat, locationLng, weatherIcon) {
	const numberLat = Number(locationLat);
	const numberLng = Number(locationLng);
	const dayNight = weatherBank[weatherIcon].dayNight;

	if (dayNight === 'day') {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: numberLat, lng: numberLng},
		zoom: 10,
		styles: mapGrayscaleStyling
	});
	}
	
	else {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: numberLat, lng: numberLng},
		zoom: 10,
		styles: mapGrayscaleStylingNight
	});
	}
}

function displayPlaylist(weatherIcon) {
	const playlistId = weatherBank[weatherIcon].playlistId;
	const playlistTheme = weatherBank[weatherIcon].playlistTheme;

	const spotifyUrl = `https://open.spotify.com/embed?uri=spotify:user:mnzheng:playlist:${playlistId}&view=coverart&theme=${playlistTheme}`;

	$('.js-resultspage').removeClass("hidden");
	$('.js-playlistiframe').attr("src", `${spotifyUrl}`);
}

function apiZipcodeFail(data) {
	$('.js-errormessage-zc').addClass("hidden");

	const apiError = data.responseJSON.message;
	$('.js-apierrormessage-zc').removeClass("hidden");
	$('.js-apierrormessage-zc').html(`Error: ${apiError}. Please try again.`);

}

function apiCityCountryFail(data) {
	$('.js-errormessage-city, .js-errormessage-cc').addClass("hidden");

	const apiError = data.responseJSON.message;
	$('.js-apierrormessage-cc').removeClass("hidden");
	$('.js-apierrormessage-cc').html(`Error: ${apiError}. Please try again.`);

}

function displayApiSearchData(data) {
	$('.js-resultspage').addClass("hidden");
	$('.form-textinput').val('');
	$('.js-locationpage').addClass("hidden");
	$('.js-errormessage-zc, .js-errormessage-city, .js-errormessage-cc, .js-apierrormessage-zc, .js-apierrormessage-cc').addClass("hidden");

	const weatherIcon = data.weather[0].icon;

	const locationLat = data.coord.lat;
	const locationLng = data.coord.lon;

	displayPlaylist(weatherIcon);
	displayMap(locationLat, locationLng, weatherIcon);
	getUnsplashData(weatherIcon, changeBg);
	restartButton();
}

function getWeatherData(searchTerm, searchTerm2, callback, failCallback) {
	const query = {
		q: `${searchTerm},${searchTerm2}`,
		units: 'imperial',
		APPID: '753488c2e76956786a10dc9e1ab0243a',
	}

	$.getJSON(OPENWEATHER_SEARCH_URL, query, callback).fail(failCallback);
}


function submitLocation() {
	$('.js-locationpage').removeClass("hidden");

	$('.js-form-zipcode').submit(function(event) {
		event.preventDefault();
		$('.js-errormessage-zc, .js-apierrormessage-zc').addClass("hidden");

		if ($('.js-zipcode').val() === '') {
			$('.js-errormessage-zc').removeClass("hidden");
			return;
		}
		else if ($('.js-zipcode').val().length <= 4) {
			$('.js-errormessage-zc').removeClass("hidden");
			return;
		}

		const zipcodeTarget = $(event.currentTarget).find('.js-zipcode');
		const zipcode = zipcodeTarget.val();
		const countryDefault = 'us';

		getWeatherData(zipcode, countryDefault, displayApiSearchData, apiZipcodeFail);
	});

	$('.js-form-citycountry').submit(function(event) {
		event.preventDefault();
		$('.js-errormessage-city, .js-errormessage-cc, .js-apierrormessage-cc').addClass("hidden");

		if ($('.js-city').val() === '') {
			$('.js-errormessage-city').removeClass("hidden");
			return;
		}
		else if ($('.js-countrycode').val() === '') {
			$('.js-errormessage-cc').removeClass("hidden");
			return;
		}

		const cityTarget = $(event.currentTarget).find('.js-city');
		const city = cityTarget.val();
		const countrycodeTarget = $(event.currentTarget).find('.js-countrycode');
		const countryCode = countrycodeTarget.val();

		getWeatherData(city, countryCode, displayApiSearchData, apiCityCountryFail);
	});
}

function startApp() {
	$('.js-startbutton').on('click', function(event){
		event.preventDefault();

		$('.js-resultspage').addClass("hidden");
		$('.js-homepage').addClass("hidden");

		submitLocation();
	});
}

$(startApp);