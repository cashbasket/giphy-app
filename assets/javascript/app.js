/*eslint-env jquery*/
var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers', 'treehouse of horror'];
var curObjArray, curTopic;

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
			.fail(function () {
				$('#results').empty();
				$('.instructions').removeClass('hidden')
					.html('<h2>ERROR: Unable to retrieve GIFs!</h2>');
				doh();
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
	//create initial buttons
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