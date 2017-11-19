var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers', 'treehouse of horror'];
var curTopic;
var toPreload = [];

// math stuff
var numCols = 4;
var colMargin = 10;
var colWidth = (($('.content-container').width() - (colMargin * 3)) / numCols);
var columnLefts = [0, colWidth + colMargin, (colWidth + colMargin) * 2, (colWidth + colMargin) * 3];
var gifWidth = colWidth - 12;  // padding on both sides + border on both sides = 12

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		$('<button />').attr('id', 'button-' + i)
			.attr('data-value', topicArray[i])
			.addClass('btn btn-option topic')
			.prepend(topicArray[i])
			.appendTo($('#buttons'));
	}
}

function getGIFs(topic, limit) {
	if (curTopic != topic) {
		$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=' + limit)
			.done(function (response) {
				curTopic = topic;
				var topicGIFs = [];
				var result = response.data;
				var lastInColHeight, lastInColTop, lastLeft;
				var resultList = $('<ul>').addClass('result-list');

				$('#currentTopic').text(curTopic);
				$('.instructions').removeClass('hidden');
				$('#results').empty();
				
				for (var i = 0; i < result.length; i++) {
					topicGIFs.push(result[i].images.original.url);
					var imgItem = $('<li>').attr('id', 'item-' + i)
						.attr('style', 'top: 0')
						.addClass('list-item');
					var imgDiv = $('<div>').attr('id', 'imgDiv-' + i);
					var dummyImg = $('<img src="assets/images/blank.gif" width="270" />').attr('id', 'dummy-' + i)
						.attr('height', result[i].images.original_still.height * (gifWidth / result[i].images.original_still.width));
					var img = $('<img />').attr('id', 'img-' + i)
						.attr('src', result[i].images.original_still.url)
						.attr('data-still', result[i].images.original_still.url)
						.attr('data-animated', result[i].images.original.url)
						.attr('data-state', 'still')
						.attr('alt', result[i].title)
						.addClass('result-image hidden');
					var rating = $('<span>').attr('id', 'rating-' + result[i].id)
						.addClass('rating-span')
						.text('Rating: ' + result[i].rating.toUpperCase());
					$('#results').append(resultList.append(imgItem.append(imgDiv.append(dummyImg).append(img)).append(rating)));

					lastLeft = columnLefts[i % 4];

					if(i >= 4) {
						lastInColHeight = $('#item-' + (i - 4)).outerHeight(true);
						lastInColTop = $('#item-' + (i - 4)).css('top').split('p')[0];
						$('#item-' + i).attr('style', 'position: absolute; left: ' + lastLeft + 'px; top: ' + (parseInt(lastInColHeight) + parseInt(lastInColTop) + 'px'));
					} else {
						lastInColHeight = $('#item-' + i).outerHeight(true);
						lastInColTop = $('.instructions').outerHeight(true);
						$('#item-' + i).attr('style', 'position: absolute; left: ' + lastLeft + 'px; top: ' + parseInt(lastInColTop) + 'px');
					}
					
					$('#img-' + i).on('load', function() {
						var curIndex = $(this).attr('id').split('-')[1];
						$(this).removeClass('hidden');
						$('#dummy-' + curIndex).addClass('hidden');
					});
				}
				preloadTopicGIFs(topicGIFs);
			})
			.fail(function () {
				$('#results').empty();
				$('.instructions').removeClass('hidden')
					.html('<h2>ERROR: Unable to retrieve GIFs!</h2>');
				doh();
			});
	}
}

//preload all the GIFs for the topic to speed things up a bit
//(it was taking a long time for the animated GIFs to load after the still images were clicked)
function preloadTopicGIFs(array) {
	for (var i = 0; i < array.length; i++){
		toPreload[i] = new Image();
		toPreload[i].src = array[i];
	}
}

function toggleAnimation(btnId) {
	var btn = $('#' + btnId);
	if (btn.attr('data-state') === 'animated') {
		btn.attr('src', btn.attr('data-still'))
			.attr('data-state', 'still');
	} else {
		btn.attr('src', btn.attr('data-animated'))
			.attr('data-state', 'animated');
	}
}

function addTopic(value) {
	var alreadyAdded = false;
	var topicIndex = 0;
	$('#formMessage').addClass('hidden').text('');
	for (var i = 0; i < topics.length; i++) {
		if (topics[i].toLowerCase() === value.toLowerCase().trim()) {
			$('#button-' + i).addClass('pulsate');
			topicIndex = i;
			$('#formMessage').removeClass('hidden green')
				.text('That topic already exists.')
				.addClass('red');
			alreadyAdded = true;
			break;
		}
	}

	if (!alreadyAdded && value.trim().length > 0) {
		topics.push(value.toLowerCase().trim());
		$('#buttons').empty();
		$('#formMessage').removeClass('hidden')
			.addClass('green')
			.text('Topic added successfully!');
		createButtons(topics);
		$('#button-' + (topics.length - 1)).addClass('pulsate');

	} else if (value.trim().length === 0) {
		$('#formMessage').removeClass('hidden green')
			.text('Please enter a topic.')
			.addClass('red');
	}

	$('#input').val('');
	setTimeout(function () {
		$('#button-' + topicIndex + ', #button-' + (topics.length - 1)).removeClass('pulsate');
		$('#formMessage').addClass('hidden');
	}, 6000);
}

function doh() {
	var audio = document.getElementById('audio');
	audio.play();
}

$(function () {
	createButtons(topics);

	$('body').on('click', '.topic', function () {
		getGIFs($(this).attr('data-value'), 10);
	});

	$('body').on('click', '.result-image', function () {
		toggleAnimation($(this).attr('id'));
	});

	$('#form').on('submit', function (e) {
		e.preventDefault();
		addTopic($('#input').val());
	});
});