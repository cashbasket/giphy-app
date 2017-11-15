var apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
var topics = ['homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'd\'oh', 'woohoo', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz', 'super nintendo chalmers'];

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		var topicButton = $('<button />').attr('data-value', topicArray[i]).addClass('btn btn-option topic').prepend(topics[i]).appendTo($('#buttons'));
	}
}

function getGifs(topic) {
	$.ajax('http://api.giphy.com/v1/gifs/search?q=' + encodeURI(topic) + '&api_key=' + apiKey + '&limit=10')
	.done(function(result) {
		$('#results').empty();
		for (var i = 0; i < result.data.length; i++) {
			$('<img />').attr('id', result.data[i].id).attr('src', result.data[i].images.fixed_height_still.url).attr('alt', 'Image of ' + topic).addClass('result-image').appendTo($('#results'));
		}
		
	})
	.fail(function(error) {
		console.log(error);
	});
}

function toggleAnimation(id) {
	//first, get individual image object based on id
	$.ajax('http://api.giphy.com/v1/gifs/' + id + '?api_key=' + apiKey)
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
	topics.push(value);
	$('#buttons').empty();
	createButtons(topics);
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

	$('#add').on('click', function(e) {
		e.preventDefault();
		addTopic($('#input').val());
	});
});