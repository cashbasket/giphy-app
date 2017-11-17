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

function getGifs(topic) {
	//un-pulsate the new buttons, if applicable
	for (var i = 0; i < topics.length; i++) {
		if (topics[i] === lastItem) {
			$('#button-' + i).removeClass('pulsate');
		}
	}

  // don't make an API call over and over if user clicks same button multiple times in succession
  if (curTopic != topic) {
    $.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=10')
		.done(function(result) {
			curTopic = topic;
			curObjArray = result.data;
			$('.instructions').removeClass('hidden');
			$('#results').empty();

			$('<ul>').addClass('result-list').appendTo($('#results'));
			for (var i = 0; i < curObjArray.length; i++) {
				var imgItem = $('<li>');
				var rating = $('<span>').attr('id', 'rating-' + curObjArray[i].id)
					.addClass('rating-span')
					.text('Rating: ' + curObjArray[i].rating.toUpperCase());
				var img = $('<img />').attr('id', 'img-' + i)
					.attr('data-id', curObjArray[i].id).attr('src', curObjArray[i].images.fixed_height_still.url)
					.attr('alt', topic + ' GIF')
					.addClass('result-image')
					.appendTo($('#results'));
				$('.result-list').append(imgItem.append(img).append(rating));
			}
		})
		.fail(function(error) {
			$('#results').empty();
			$('#results').html('<h2 class="well">ERROR: Unable to retrieve GIFs!</h2>');
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
	$('#formError').addClass('hidden').text('');
	for (var i = 0; i < topics.length; i++) {
		if (topics[i] === value.trim()) {
			alreadyAdded = true;
			break;
		}
	}

	if (!alreadyAdded && value.trim().length > 0) {
		topics.push(value);
		$('#buttons').empty();
		createButtons(topics);
		lastItem = topics[topics.length - 1];

		for (var i = 0; i < topics.length; i++) {
			$('#button-' + i).removeClass('pulsate');
			if (topics[i] === lastItem) {
			$('#button-' + i).addClass('pulsate');
			}
		}
		$('#input').val('');
	} else if (alreadyAdded) {
		var topicIndex;
		for (var i = 0; i < topics.length; i++) {
			$('#button-' + i).removeClass('pulsate');
			if (topics[i] === value.trim()) {
			$('#button-' + i).addClass('pulsate');
			topicIndex = i;
			}
		}
		setTimeout(function() {
			$('#button-' + topicIndex).removeClass('pulsate');
		}, 6000);
		$('#formError').removeClass('hidden').text('That topic already exists.');
	} else if (value.trim().length === 0) {
		$('#formError').removeClass('hidden').text('Please enter a topic.');
	}
}

$(function() {
	//create initial buttons
	createButtons(topics);

	$('body').on('click', '.topic', function() {
		getGifs($(this).attr('data-value'));
	});

	$('body').on('click', '.result-image', function() {
		toggleAnimation($(this).attr('id'));
	});

	$('#form').on('submit', function(e) {
		e.preventDefault();
		addTopic($('#input').val());
	});
});