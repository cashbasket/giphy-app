var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers', 'treehouse of horror', 'sacrilicious'];

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		var topicButton = $('<button />').attr('data-value', topicArray[i]).addClass('btn btn-option topic').prepend(topics[i]).appendTo($('#buttons'));
	}
}

function getGifs(topic) {
	$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURI(topic) + '&api_key=' + apiKey + '&limit=10')
	.done(function(result) {
		$('.instructions').removeClass('hidden');
		$('#results').empty();
		for (var i = 0; i < result.data.length; i++) {
			var imgDiv = $('<div>').addClass('img-div');
			var rating = $('<span>').addClass('rating-span').text('Rating: ' + result.data[i].rating.toUpperCase());
			var img = $('<img />').attr('id', result.data[i].id).attr('src', result.data[i].images.fixed_height_still.url).attr('alt', 'Image of ' + topic).addClass('result-image').appendTo($('#results'));
			$('#results').append(imgDiv.append(img).append(rating));
		}	
		
	})
	.fail(function(error) {
		console.log(error);
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
		console.log(error);
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