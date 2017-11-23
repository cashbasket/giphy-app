// inital topics array
var topics = ['the simpsons', 'homer simpson', 'bart simpson', 'lisa simpson', 'maggie simpson', 'marge simpson', 'grampa simpson', 'barney gumbel', 'sideshow bob', 'chief wiggum', 'ralph wiggum', 'milhouse', 'nelson muntz'];

var curTopic, lastInColHeight, lastInColTop, left, endOfPage;
var offset = 0;

// global constants
const containerWidth = $('.container').width();
const asideWidth = $('.add-well').outerWidth();
const itemPadding = parseInt($('.result-list > li').css('padding-left'));
const itemBorderWidth = $('.result-list > li').css('border-left-width').split('p')[0];
const numCols = 4;
const gutterWidth = 10;
const apiKey = '9D0xuOupi5AKDiYYkzFcM1gWkWMDLqCb';
const perCall = 50; //number of GIFs to pull per API call (for infinite scrolling)

// keep track of the total number of gifs for each topic for infinite scroll (initialize to value of perCall)
var totalGIFsForTopic = perCall;

// global math stuff for making life easier (if I want to change container width, all I have to do us update its width in the css and everything else inside the container will adjust accordingly)
const colWidth = (containerWidth - (gutterWidth * (numCols - 1))) / numCols;
const gifWidth = colWidth - (itemPadding * 2) - (itemBorderWidth * 2);
var columnLefts = [];

//populate columnLefts array, which will be used to determine the "left" css property for items in each column
for(var i = 0; i < numCols; i++) {
	columnLefts.push((colWidth + gutterWidth) * i);
}

//since add topic form width is the same regardless of container size, we must set the width of the buttons div with math!
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

//basically just adds "btn-selected" class to the appropriate button
function addSelectedButtonStyle() {
	for (var i = 0; i < topics.length; i++) {
		if ($('#button-' + i).text() == curTopic) {
			$('#button-' + i).addClass('btn-selected');
			break;
		}
	}
}

//handles creation and lazy-loading of GIFs and their containers
function buildItems(response, offset = 0) {
	var topicGIFs = [];
	var results = response.data;

	if (results.length === 0) {
		$('<h2>').text('There are no GIFs for this topic. Sorry!').attr('style', 'position: absolute; top: 50px').appendTo($('#results'));
		return;
	} else {
		$('#results h2').remove();
	}

	if(offset === 0) {
		$('.result-list').empty();
	}

	for (var i = offset; i < results.length + offset; i++) {
		var result = results[i - offset];
		var adjustedHeight = result.images.fixed_width.height * (gifWidth / result.images.fixed_width.width);
		topicGIFs.push(result.images.fixed_width.url);
		var imgItem = $('<li>').attr('id', 'item-' + i)
			.attr('style', 'top: 0')
			.addClass('list-item');
		var imgDiv = $('<div class="img-div">').attr('id', 'imgDiv-' + i)
			.attr('style', 'background-color: ' + randomColor() + '; width: 100%; height: ' +  adjustedHeight + 'px;');
		var img = $('<img />').attr('id', 'img-' + i)
			.attr('src', 'assets/images/blank.gif')
			.attr('data-src', result.images.fixed_width_still.url)
			.attr('data-still', result.images.fixed_width_still.url)
			.attr('data-animated', result.images.fixed_width.url)
			.attr('data-state', 'still')
			.attr('height', adjustedHeight)
			.attr('alt', result.title)
			.addClass('result-image');
		var rating = $('<span>').attr('id', 'rating-' + result.id)
			.addClass('rating-span')
			.text('Rating: ' + result.rating.toUpperCase());
		$('.result-list').append(imgItem.append(imgDiv.append(img)).append(rating));				

		// this determines the value of the "left" css property to be used (see global "columnLefts" array)
		left = columnLefts[i % numCols];

		if(i > numCols - 1) {
			// find height of last item in same column as item to be updated
			lastInColHeight = $('#item-' + (i - numCols)).outerHeight(true);
			// find "top" css value of last item in same column as item to be updated
			lastInColTop = $('#item-' + (i - numCols)).css('top').split('p')[0];
			// append "style" HTML attribute to item to position it properly
			$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + left + 'px; top: ' + (parseInt(lastInColHeight) + parseInt(lastInColTop) + gutterWidth + 'px'));
		} else {
			lastInColHeight = $('#item-' + i).outerHeight(true);
			lastInColTop = $('.options-div').outerHeight();
			$('#item-' + i).attr('style', 'width: ' + colWidth + 'px; position: absolute; left: ' + left + 'px; top: ' + parseInt(lastInColTop) + 'px');
		}

		if (i === results.length + offset - 1) {
			endOfPage = parseFloat($('#item-' + i).outerHeight(true)) + parseFloat($('#item-' + i).css('top').split('p')[0]);
		}
	}

	$('.result-image').Lazy({
		scrollDirection: 'vertical',
		effect: 'fadeIn',
		effectTime: 400,
		visibleOnly: true,
		defaultImage: 'assets/images/blank.gif'
	});
}

function error() {
	$('#results').empty();
	$('<h2 class="red">').text('ERROR: Unable to retrieve GIFs!').attr('style', 'position: absolute; top: 50px').appendTo($('#results'));
	doh();
}

function getInfiniteGIFs(topic, force = false) {
	if (curTopic != topic || force) {
		if (topic != curTopic) {
			offset = 0;
		}
		if (offset < totalGIFsForTopic) {
			$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&offset=' + offset + '&limit=' + perCall)
				.done(function (response) {
					totalGIFsForTopic = response.pagination.total_count;
					if(topic != curTopic) {
						$('.result-list').empty();
					}
					$('.topic').removeClass('btn-selected');
					curTopic = topic;
					addSelectedButtonStyle();
					buildItems(response, offset);
					
					window.onscroll = function() {
						if ((window.innerHeight + Math.ceil(window.pageYOffset + 1)) >= endOfPage) {
							window.onscroll = null;
							getInfiniteGIFs(curTopic, true);
						}
					};
					offset += perCall;
				})
				.fail(function () {
					error();
				});
		}
	}
}

function getGIFs(topic, limit, force = false) {
	if (curTopic != topic || force) {
		// we have to reset the offset for infinite scrolling AND nullify the onscroll event every time the user chooses to go from infinite GIFs back to finite GIFs
		offset = 0;
		window.onscroll = null;

		$.ajax('https://api.giphy.com/v1/gifs/search?q=' + encodeURIComponent(topic) + '&api_key=' + apiKey + '&limit=' + limit)
			.done(function (response) {
				if(topic != curTopic) {
					$('.result-list').empty();
				}
				$('.topic').removeClass('btn-selected');
				curTopic = topic;
				addSelectedButtonStyle();
				buildItems(response);
			})
			.fail(function () {
				error();
			});
	}
}

function randomColor() {
	var colors = ['#f9db45', '#98d9f9', '#999999', '#d5effc', '#000000', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ff00ff'];
	return colors[Math.floor(Math.random() * colors.length)];
}

function toggleAnimation(imgId) {
	var img = $('#' + imgId);
	if (img.attr('data-state') === 'animated') {
		img.attr('src', img.attr('data-still'))
			.attr('data-state', 'still');
	} else {
		img.attr('src', img.attr('data-animated'))
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
		if($('#numGifs').val() == 'infinite') {
			getInfiniteGIFs($(this).attr('data-value'), true);
		} else {
			getGIFs($(this).attr('data-value'), $('#numGifs').val());
		}
	});

	$('body').on('click', '.result-image', function () {
		toggleAnimation($(this).attr('id'));
	});

	$('body').on('change', '#numGifs', function() {
		if($(this).val() == 'infinite') {
			getInfiniteGIFs(curTopic, true);
		} else {
			getGIFs(curTopic, $(this).val(), true);
		}
	});

	$('#form').on('submit', function (event) {
		event.preventDefault();
		addTopic($('#input').val());
	});
});