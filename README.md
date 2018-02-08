# The Simpsons (.gif)

**The Simpsons (.gif)** started off as an excuse to mess around with the [GIPHY API](https://developers.giphy.com/), but it quickly became more interesting than that. It pretty much works like GIPHY proper, but it's Simpsons-themed. Being a die-hard Simpsons fan, I wanted a place where I could look at Simpsons GIFs on my phone or computer as quickly and efficiently as possible. This was my solution.

[View the site](https://cashbasket.github.io/giphy-app/)

## How It Works

This app was meant to maximize the user's total GPS (GIFs per second), so it's relatively easy to use. To view one of the predefined topics, simply click on any of the buttons at the top of the screen, and voila! Your page should be loaded with 10 relevant GIFs. If you want to view MORE than 10 &ndash; which I always do &ndash; change the lone dropdown menu from "10" to "tons of," infinite scrolling will rear its beautiful head (50 are loaded at a time), and you will hopefully see more Simpsons GIFs than you ever cared to. Please note that if you add a really super-specific topic OR if you add a random gibberish topic, you probably won't see a lot of GIFs. Those are the breaks.

You can also add topics by entering a topic name into the text field at the top-right of the page, and a button will be created for that topic.  Click the newly-created topic button, and you're all set.

## Design and Code and Stuff

The site was designed to be as responsive as possible, so it should hopefully work okay on phones, tablets, etc. The GIF elements are positioned using a bunch of Javascript I wrote myself, but arguably didn't need to in the end, since I later learned about the existence of Masonry.js. BUT, I was up for the challenge anyway. Plus, I later tried to use Masonry.js for another project afterward, and it was really nice but couldn't quite get it configured the way I needed it to, so it's nice to know how to do these things.

## Thanks

Thanks to [GIPHY](https://www.giphy.com) for making an API that actually works pretty well, and thanks to the creators of [jQuery Lazy](http://jquery.eisbehr.de/lazy/) and [jQuery Appear](https://github.com/morr/jquery.appear) for writing plugins that helped spruce the site up a bit. Also, thanks to Matt Groening for creating the show that basically defined my adolescent years.