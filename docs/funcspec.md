# Streamcore Functional Specifications.

## Overview.

Streamcore is a light and sleek alternative (hopefully superior to the default)
interface for watching Twitch.tv streams. The goal of Streamcore is to be the
most innovative and feature rich Twitch.tv interface while still remaining fast
and light.

## Pages.

This is a list of the different pages in the application and a brief explanation
of what the page is for.

### Front page.

This is the front page of the application and the landing page of the site. This
page displays a large logo of Streamcore and the stream lists and streams that
the current user has pinned to the front page.

The navigation bar contains the following links:

  - Games: Leads to the **Games** page.
  - Help: Leads to the **Help** page.
  - About: Leads to the **About** page.
  - Facebook: Leads to the Facebook Streamcore page.

The content area of this page will contain any stream lists and single streams
that the user has pinned to the front page. The user will be able to pin any
game to the front page, either from the games page or from the display page,
which will appear on the front page as a stream list. Any pinned games will
appear as a game tile, just as in **Game**.

### Games.

This page contains a list of game tiles, each with Twitch.tv's cover art for that
game. Each list item should also contain the number of live streams in the game
category and the amount of viewers the game has. When a game is clicked, the
user is navigated to the **Game** page for the clicked game.

### Streams.

This page contains all the streams for a specific game, or conceivably all the
user's favorite streams, as well as game information, game news, current
tournaments for the game etc. Clicking on a stream will take the user to the
**Display** page for that stream.

By default, every stream shows up as a tile, but the view can be configured to a
detailed list instead.

### Help.

This page contains a F.A.Q. section as well as instructions on how to use the
application. The contents of this page should be updated frequently, but
includes:

  - A link to this spec.
  - A quick walkthrough of how to navigate the pages and what the pages contain.
  - A description of the keyboard shortcuts in the **Display** page.

### About.

This page contains the description and goals of Streamcore, much like the
*Overview* section in this spec. It also contains the names and contact
information of the people involved in developing Streamcore.  

### Display.

This is the most important page in the Streamcore application. It displays a
stream in the main area of the window. A stream list of the current game is
displayed to the left of the stream. The stream list can be minimized which will
hide it completely. It can be restored from the control bar which is displayed
at the top of the window. The stream list in **Display** can also display the
games list, which allows the user to browse streams from any game from the
**Display** page.

The control bar contains controls for showing/hiding the stream list, changing
the page layout, showing/hiding the stream info panel and showing/hiding the
control bar. When the control bar is hidden, it can be shown by moving the mouse
near the top edge of the window.

The layout of the **Display** page can be changed into 6 different
configurations. The point of this is to let the user watch multiple streams in
one window. When the layout configuration is anything other than *Normal*, the
stream list button is removed from the main control bar. Instead it will appear
in the info panel for each stream window. The layout configurations are as
follows:

  - *Normal*: Displays 1 stream in the main area of the window.
  - *Vertical split*: Displays 2 streams side by side.
  - *Horizontal split*: Displays 2 streams, one on top of the other.
  - *Four split*: Displays 4 streams in a grid.
  - *Plus two*: Displays 3 streams, one big stream with 2 small ones on top.
  - *Plus three*: Displays 4 streams, one big stream with 3 small ones on top.

When the layout configuration is anything other than *Normal*, one of the
stream windows will always be in "focus". When a stream window is in focus, it's
info panel will have a green background, and only that stream will have audio.
If the info panel is hidden there will instead be a 1px green border around the
active stream window. Switching focus to another stream is simply a matter of
clicking another stream window.

The stream info panel is a panel similar to the one shown above streams at
honstreams.com. Is contains the stream name, the stream session title, a link to
the stream page, buttons for showing/hiding and popping out the stream chat and
the amount of viewers the stream has. When the **Display** layout is anything
other than *Normal*, the stream info panel also contains a button for showing
the stream list for the parent stream window.

The stream info panel has three states: Hidden, minimized and normal. When in
the normal state, it is about 100px high and displays the information listed
above. When in the minimized state it's only about 30px high and contains only
the stream title and the most important buttons.

## Scenarios.

### Ordinary Joe.

Joe wants to watch a DotA2 stream of a current huge DotA2 tournament. He visits
Streamcore.tv and looks for "Dota 2" in the list of games on the front page.
It's not there, so he clicks **Games** in the navigation bar. He finds DotA2
some way down in the list and notices a star icon. When he hovers the mouse over
the star icon a tooltip appears with the text "Add to favorite games". "Well,
this is one of my favourite games" he thinks, and clicks the star. The star now
goes from being transparent to being golden. He then clicks the game, and a list
of streams appears on the left side of the screen. He recognizes the stream "The
Premier League" and clicks it. The list of games disappears, and in its place
the stream "The Premier League" appears, as well as a small control bar at the
top of the screen. "Great! But I don't really need the stream list anymore
though", Joe thinks. He searches the screen for a way to hide it, and sure
enough, in the control bas he finds a button with a picture of the sidebar on it
that says "Hide sidebar". He clicks it, and the sidebar slides out of view,
expanding the stream to the full width of the screen. Joe is happy!

### Control-freak Chris.

Chris knows there is a League of Legends tournament going on, and he knows there
are multiple streams covering it. He wants to watch all the streams at once, and
he's heard that Streamcore.tv has PiP functionality. He opens the application
and immediately spots one of the streams he wants to watch in the League of
Legends stream list on the **Front page**. He clicks it and is taken to the
**Display** page where the stream starts playing. Chris searches the screen for
any clues about the PiP functionality and spots a row of buttons with what looks
like pictures of PiP layouts on them. He clicks the button that displays a
two-row layout with three routes in the top row and one wide route in the bottom
row. Instantly the page changes, adding three small boxes above the playing
stream. The stream list disappears, and a small button with a picture of the
stream list appears in the info panel of the playing stream. The three small
boxes each contains a list of League of Legends streams, and a button that says
"Back to games". In the list of streams Chris finds one of the other streams he
wants to watch and clicks it. The list disappears and the window is instead
filled with the stream he clicked. Awesome!! He repeats the process for the next
two windows as well. He notices that the last window he sets up has a green
background, and that only that stream has sound. When he clicks the other
streams, those streams get the green background instead and only those streams
have sound. He also notices that the small streams has a button in their control
bar that looks like a maximize button. When he clicks it, the small stream is
moved to the bottom row, becoming large, while the previously large stream takes
its place. Neat'o! Now he can watch the streams and toggle which stream he is
focusing on by selecting it with the mouse. Chris is happy!  

### Confused Carla.

TBA

