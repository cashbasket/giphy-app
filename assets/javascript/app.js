/*eslint-env jquery*/
var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers', 'treehouse of horror'];
var lastItem, curObjArray, curTopic;

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		$('<button />').attr('id', 'button-' + i)
			.attr('data-value', topicArray[i])
			.addClass('btn btn-option topic')
			.prepend(topicArray[i])
			.appendTo($('#buttons'));
	}
	lastItem = topicArray[topicArray.length - 1];
}

function getGIFs(topic, limit) {
	//un-pulsate the new buttons, if applicable
	for (var i = 0; i < topics.length; i++) {
		if (topics[i] === lastItem) {
			$('#button-' + i).removeClass('pulsate');
		}
	}

	//don't make an API call over and over if user clicks same button multiple times in succession
	if (curTopic != topic) {
		$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=' + limit)
			.done(function(response) {
				curTopic = topic;
				curObjArray = response.data;
				$('#currentTopic').text(curTopic);
				$('.instructions').removeClass('hidden');
				$('#results').empty();

				var resultList = $('<ul>').addClass('result-list');
				for (var i = 0; i < curObjArray.length; i++) {
					var imgItem = $('<li>');
					var img = $('<img />').attr('id', 'img-' + i)
						.attr('data-id', curObjArray[i].id)
						.attr('src', curObjArray[i].images.fixed_height_still.url)
						.attr('alt', topic + ' GIF')
						.addClass('result-image');
					var rating = $('<span>').attr('id', 'rating-' + curObjArray[i].id)
						.addClass('rating-span')
						.text('Rating: ' + curObjArray[i].rating.toUpperCase());
					$('#results').append(resultList.append(imgItem.append(img).append(rating)));
				}
			})
			.fail(function() {
				$('#results').empty();
				$('.instructions').removeClass('hidden')
					.html('<h2>ERROR: Unable to retrieve GIFs!</h2>');
			});
	}
}

function toggleAnimation(id) {
	var idSplit = id.split('-');
	var pos = idSplit.pop();

	if ($('#' + id).attr('class') === 'result-image animated') {
		$('#' + id).attr('src', curObjArray[pos].images.fixed_height_still.url)
			.removeClass('animated');
	} else {
		$('#' + id).attr('src', curObjArray[pos].images.fixed_height.url)
			.addClass('animated');
	}
}

function addTopic(value) {
	var alreadyAdded = false;
	$('#formMessage').addClass('hidden').text('');
	for (var i = 0; i < topics.length; i++) {
		if (topics[i].toLowerCase() === value.toLowerCase().trim()) {
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
		lastItem = topics[topics.length - 1];

		for (var j = 0; j < topics.length; j++) {
			$('#button-' + j).removeClass('pulsate');
			if (topics[j] === lastItem) {
				$('#button-' + j).addClass('pulsate');
			}
		}
	} else if (alreadyAdded) {
		var topicIndex;
		for (var k = 0; k < topics.length; k++) {
			$('#button-' + k).removeClass('pulsate');
			if (topics[k].toLowerCase() === value.trim().toLowerCase()) {
				$('#button-' + k).addClass('pulsate');
				topicIndex = k;
			}
		}
		setTimeout(function() {
			$('#button-' + topicIndex).removeClass('pulsate');
		}, 6000);
		$('#formMessage').removeClass('hidden green')
			.text('That topic already exists.')
			.addClass('red');
	} else if (value.trim().length === 0) {
		$('#formMessage').removeClass('hidden green')
			.text('Please enter a topic.')
			.addClass('red');
	}
	$('#input').val('');
	setTimeout(function() {
		$('#formMessage').addClass('hidden');
	}, 6000);
}

$(function() {
	//create initial buttons
	createButtons(topics);

	$('body').on('click', '.topic', function() {
		getGIFs($(this).attr('data-value'), 10);
	});

	$('body').on('click', '.result-image', function() {
		toggleAnimation($(this).attr('id'));
	});

	$('#form').on('submit', function(e) {
		e.preventDefault();
		addTopic($('#input').val());
	});
});