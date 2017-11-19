var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['the simpsons', 'homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz'];
var curTopic;
var toPreload = [];

// global math stuff for making life easier
var numCols = 4;
var colMargin = 10;
var colWidth = (($('.container').width() - (colMargin * (numCols - 1))) / numCols);
var columnLefts = [];
for(var i = 0; i < numCols; i++) {
	columnLefts.push((colWidth + colMargin) * i);
}
var gifWidth = colWidth - 12; // padding/border can't be calculated programatically at this point, so I hard-coded a '12' (5+5+1+1)

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
				var results = response.data;
				var lastInColHeight, lastInColTop, lastLeft;
				var resultList = $('<ul>').addClass('result-list');

				$('#currentTopic').text(curTopic);
				$('.instructions').removeClass('hidden');
				$('#results').empty();
				
				for (var i = 0; i < results.length; i++) {
					var result = results[i];
					topicGIFs.push(result.images.original.url);
					var imgItem = $('<li>').attr('id', 'item-' + i)
						.attr('style', 'top: 0')
						.addClass('list-item');
					var imgDiv = $('<div>').attr('id', 'imgDiv-' + i);
					//to make sure the final height of the <li> is calculated correctly, we must load the <li> with an empty placeholder image set to the exact height of the actual image (which might not load before the height is calculated)
					var dummyImg = $('<img src="assets/images/blank.gif" width="100%" />').attr('id', 'dummy-' + i)
						.attr('height', result.images.original_still.height * (gifWidth / result.images.original_still.width));
					var img = $('<img />').attr('id', 'img-' + i)
						.attr('src', result.images.original_still.url)
						.attr('data-still', result.images.original_still.url)
						.attr('data-animated', result.images.original.url)
						.attr('data-state', 'still')
						.attr('alt', result.title)
						.addClass('result-image hidden');
					var rating = $('<span>').attr('id', 'rating-' + result.id)
						.addClass('rating-span')
						.text('Rating: ' + result.rating.toUpperCase());
					$('#results').append(resultList.append(imgItem.append(imgDiv.append(dummyImg).append(img)).append(rating)));

					lastLeft = columnLefts[i % numCols];

					if(i > numCols - 1) {
						lastInColHeight = $('#item-' + (i - numCols)).outerHeight(true);
						lastInColTop = $('#item-' + (i - numCols)).css('top').split('p')[0];
						$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + lastLeft + 'px; top: ' + (parseInt(lastInColHeight) + parseInt(lastInColTop) + 'px'));
					} else {
						lastInColHeight = $('#item-' + i).outerHeight(true);
						lastInColTop = $('.instructions').outerHeight(true);
						$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + lastLeft + 'px; top: ' + parseInt(lastInColTop) + 'px');
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
	var formattedValue = value.trim().toLowerCase();
	$('#formMessage').addClass('hidden').text('');
	for (var i = 0; i < topics.length; i++) {
		if (topics[i].toLowerCase() === formattedValue) {
			$('#button-' + i).addClass('pulsate');
			topicIndex = i;
			$('#formMessage').removeClass('hidden green')
				.text('That topic already exists.')
				.addClass('red');
			alreadyAdded = true;
			break;
		}
	}

	if (!alreadyAdded && formattedValue.length > 0) {
		topics.push(formattedValue);
		$('#buttons').empty();
		$('#formMessage').removeClass('hidden')
			.addClass('green')
			.text('Topic added successfully!');
		createButtons(topics);
		$('#button-' + (topics.length - 1)).addClass('pulsate');

	} else if (formattedValue.length === 0) {
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