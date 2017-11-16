var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers', 'treehouse of horror'];
var lastItem;

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		var topicButton = $('<button />').attr('id', 'button-' + i).attr('data-value', topicArray[i]).addClass('btn btn-option topic').prepend(topicArray[i]).appendTo($('#buttons'));
	}
	lastItem = topicArray[topicArray.length - 1];
}

function getGifs(topic) {
	//un-pulsate the new buttons, if applicable
	for(var i=0; i < topics.length; i++) {
		if(topics[i] === lastItem) {
			$('#button-' + i).removeClass('pulsate');
		}
	}
	$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=10')
	.done(function(result) {
		$('.instructions').removeClass('hidden');
		$('#results').empty();
		
		$('<ul>').addClass('result-list').appendTo($('#results'));
		for (var i = 0; i < result.data.length; i++) {
			var imgItem = $('<li>');
			var rating = $('<span>').attr('id', 'rating-' + result.data[i].id).addClass('rating-span').text('Rating: ' + result.data[i].rating.toUpperCase());
			var img = $('<img />').attr('id', result.data[i].id).attr('src', result.data[i].images.fixed_height_still.url).attr('alt', topic + ' GIF').addClass('result-image').appendTo($('#results'));
			$('.result-list').append(imgItem.append(img).append(rating));
		}	
		
	})
	.fail(function(error) {
		$('#results').empty();
		$('#results').html('<h2 class="well">ERROR: Unable to retrieve GIFs!</h2>');
	});
}

function toggleAnimation(id) {
	//first, get individual image object based on id
	$.ajax('https://api.giphy.com/v1/gifs/' + id + '?api_key=' + apiKey)
	.done(function(result) {
		if($('#' + id).attr('class') === 'result-image animated') {
			$('#' + id).attr('src', result.data.images.fixed_height_still.url).removeClass('animated');
		}
		else {
			$('#' + id).attr('src', result.data.images.fixed_height.url).addClass('animated');
		}		
	})
	.fail(function(error) {
		$('#rating-' + id).text("ERROR: Unable to animate GIF!");
	});
}

function addTopic(value) {
	var alreadyAdded = false;
	$('#formError').addClass('hidden').text('');
	for (var i = 0; i < topics.length; i++) {
		if (topics[i] === value) {
			alreadyAdded = true;
			break;
		}
	}

	if (!alreadyAdded) {
		topics.push(value);
		$('#buttons').empty();
		createButtons(topics);
		lastItem = topics[topics.length - 1];

		for(var i=0; i < topics.length; i++) {
			$('#button-' + i).removeClass('pulsate');
			if(topics[i] === lastItem) {
				$('#button-' + i).addClass('pulsate');
			}
		}
		$('#input').val('');
	}
	else {
		$('#formError').removeClass('hidden').text('That topic already exists.');
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