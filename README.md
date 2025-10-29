# Assignment 4B - Vue 3 Frontend

The application will be available at `http://localhost:5173` after running ```npm run dev```.

To test all features of the app, including recommendations, ranking, and friends, use the preexisting test user account
```
Username: testuser
Password: testuser
```

## Visual Design Study
![Color palette](colors.png)
![Typefaces and font scale](typefaces.png)


## User Journey

Bob opens the app. He’s greeted with a login screen. He tries his usual username
and password. If he didn't have an account, he'd click Register, enters a new
username and password, and gets signed in automatically. Next time, he can just
log in.

He lands on the Home page. It says “Ready to listen, Bob?” with a Generate
Recommendation button. He clicks it and a small dialog opens.

Bob types how many songs he wants (say 1) and hits Go. The app generates those
recommendations and takes him to the Rank page.

On the Rank page, Bob sees a list of “Outstanding Recommendations.” He clicks
one. A dialog opens showing that song, and a second button with another song to
compare against.

He starts ranking. If he prefers the selected song (Song A), the app keeps
showing another comparison song (Song B) moving upward through the ranked list
until he finally picks a B—or runs out of Bs. If he prefers the comparison song
first, the app moves downward through the ranked list until he picks A—or runs
out. When the comparison is decided (or short-circuited because there are no
more options), the app records the comparison and makes a post like “bob ranked
\[song] \[score]”.

Then Bob visits his Profile. He sees a list of posts the app created as he
ranked songs. Each post shows the timestamp and a short message like “bob ranked
It Will Rain - Bruno Mars 6.0”.

He clicks a post to open it. The dialog shows any existing reactions—just emojis
with counts. There’s a little + button; he taps it to pop open an emoji picker
(👍 ❤️ 😂 😮 😢 🔥 🎵). He picks one, and the reaction is added immediately. The
counts update both in the dialog and in the list.

**Updated Section:**

Bob wonders what songs his friends are posting on the app. Bob navigates to his profile page and clicks friends. There, he can view his pending and outgoing friend requests, as well as users that he is already friends with on the app.
Bob clicks on Alice's profile and is taken to her profile page. He can see Alice's posts (rankings) and sees that she ranked his favorite song 3.0/10! He reacts with a thumbs down because he disagrees with her ranking. He hopes that Alice will see his ranking.

Watch the user journey video here: [https://youtu.be/pi9Cr42bKsc](https://youtu.be/pi9Cr42bKsc). It is also [here](UserJourney.mov) if the link doesn't work


Watch the updated user journey video here: [https://youtu.be/i2wcPzqp2KY](https://youtu.be/i2wcPzqp2KY)
