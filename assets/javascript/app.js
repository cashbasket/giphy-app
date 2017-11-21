/*global preLoader:true*/

// inital topics array
var topics = ['the simpsons', 'homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz'];

// initialize curTopic, which will store current topic
var curTopic;

// global constants
const containerWidth = $('.container').width();
const asideWidth = $('.add-well').outerWidth();
const itemPadding = parseInt($('.result-list > li').css('padding-left'));
const itemBorder = $('.result-list > li').css('border-left-width').split('p')[0];
const numCols = 4;
const gutterWidth = 10;
const apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';

// global math stuff for making life easier (if I want to change container width, all I have to do us update its width in the css and everything else inside the container will adjust accordingly)
const colWidth = (containerWidth - (gutterWidth * (numCols - 1))) / numCols;
const gifWidth = colWidth - (itemPadding * 2) - (itemBorder * 2);
var columnLefts = [];

//populate columnLefts array, which will be used to determine the "left" css property for items in each column
for(var i = 0; i < numCols; i++) {
	columnLefts.push((colWidth + gutterWidth) * i);
}

//since add topic form width is the same regardless of container size, we must set the width of the buttons div accordingly
$('.button-div').css('width', parseInt(containerWidth - asideWidth - gutterWidth) + 'px');

function createButtons(topicArray) {
	for (var i = 0; i < topicArray.length; i++) {
		$('<button />').attr('id', 'button-' + i)
			.attr('data-value', topicArray[i])
			.addClass('btn btn-option topic')
			.prepend(topicArray[i])
			.appendTo($('#buttons'));
		if ($('#button-' + i).text() == curTopic) {
			$('#button-' + i).addClass('btn-selected');
		}
	}
}

function getGIFs(topic, limit, force = false) {
	if (curTopic != topic || force) {
		$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=' + limit)
			.done(function (response) {
				$('.topic').removeClass('btn-selected');
				curTopic = topic;
				for (var t = 0; t < topics.length; t++) {
					if ($('#button-' + t).text() == curTopic) {
						$('#button-' + t).addClass('btn-selected');
						break;
					}
				}
				var topicGIFs = [];
				var results = response.data;
				var lastInColHeight, lastInColTop, left;
				var resultList = $('<ul>').addClass('result-list');

				$('#currentTopic').text(curTopic);
				$('#results').empty();
				
				for (var i = 0; i < results.length; i++) {
					var result = results[i];
					var adjustedHeight = result.images.downsized_still.height * (gifWidth / result.images.downsized_still.width);
					topicGIFs.push(result.images.downsized_medium.url);
					var imgItem = $('<li>').attr('id', 'item-' + i)
						.attr('style', 'top: 0')
						.addClass('list-item');
					var imgDiv = $('<div class="img-div">').attr('id', 'imgDiv-' + i)
						.attr('style', 'background-color: ' + randomColor() + '; width: 100%; height: ' +  adjustedHeight + 'px');
					var imgLoading = $('<div class="loading">').attr('id', 'loading-' + i).attr('style', 'width: 100%; height: ' +  adjustedHeight + 'px').text('Loading');
					var img = $('<img />').attr('id', 'img-' + i)
						.attr('src', result.images.downsized_still.url)
						.attr('data-still', result.images.downsized_still.url)
						.attr('data-animated', result.images.downsized_medium.url)
						.attr('data-state', 'still')
						.attr('alt', result.title)
						.addClass('result-image');
					var rating = $('<span>').attr('id', 'rating-' + result.id)
						.addClass('rating-span')
						.text('Rating: ' + result.rating.toUpperCase());
					$('#results').append(resultList.append(imgItem.append(imgDiv.append(imgLoading).append(img)).append(rating)));

					// immediately hide gif so we can fade it in when loading is done
					$('#img-' + i).hide();

					// this determines the value of the "left" css property to be used (see global "columnLefts" array)
					left = columnLefts[i % numCols];

					if(i > numCols - 1) {
						// find height of last item in same column as item to be updated
						lastInColHeight = $('#item-' + (i - numCols)).outerHeight(true);
						// find "top" css value of last item in same column as item to be updated
						lastInColTop = $('#item-' + (i - numCols)).css('top').split('p')[0];
						// append "style" HTML attribute to item to position it properly
						$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + left + 'px; top: ' + (parseInt(lastInColHeight) + parseInt(lastInColTop) + 'px'));
					} else {
						lastInColHeight = $('#item-' + i).outerHeight(true);
						lastInColTop = $('.options-div').outerHeight();
						$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + left + 'px; top: ' + parseInt(lastInColTop) + 'px');
					}

					$('#img-' + i).on('load', function() {
						$(this).fadeIn(250);
					});
				}
				//preload all the GIFs for the topic to speed things up a bit (I know, it seems pointless, but the images were taking too long to load on click)
				preloadAnimated(topicGIFs);
			})
			.fail(function () {
				$('#results').empty()
					.html('<h2>ERROR: Unable to retrieve GIFs!</h2>');
				doh();
			});
	}
}

function randomColor() {
	var colors = ['#f9db45', '#98d9f9', '#999999', '#d5effc', '#000000', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ff00ff'];
	return colors[Math.floor(Math.random() * colors.length)];
}

function preloadAnimated(imagesArray) {
	new preLoader(imagesArray);
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

function init() {
	getGIFs(topics[0], 10);
	createButtons(topics);
}

$(document).ready(function () {
	init();
	$('body').on('click', '.topic', function () {
		getGIFs($(this).attr('data-value'), $('#numGifs').val());
	});

	$('body').on('click', '.result-image', function () {
		toggleAnimation($(this).attr('id'));
	});

	$('body').on('change', '#numGifs', function() {
		getGIFs(curTopic, $(this).val(), true);
	});

	$('#form').on('submit', function (e) {
		e.preventDefault();
		addTopic($('#input').val());
	});
});