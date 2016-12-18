var app = new Vue({
  el: '#app',
  data: {
    username1: '',
    username2: '',
    currentTweetText: '',
    currentTweetAuthor: '',
    showUsernameForm: true,
    showTweetDisplay: false,
    currentTweetAnswered: false,
    score: 0,
    loading: false
  },
  methods: {
    usernameFormButton: function() {
      this.showTweetDisplay = true;
      this.showUsernameForm = false;
      this.displayNextTweet();
    },
    nextTweetButton: function() {
      this.resetTweetDisplay();
      this.displayNextTweet();
    },
    tryDifferentUsersButton: function() {
      this.showUsernameForm = true;
      this.showTweetDisplay = false;
    },
    displayNextTweet: function() {
      var self = this;
      // Make AJAX request
      self.loading = true;
      $.ajax(
        {
          url: "http://127.0.0.1:3000/api/random_twitter?userA=" + self.username1 + "&userB=" + self.username2
        }
      ).done(function(data) {
        // Update currentTweet object
        self.currentTweetText = data["tweet"];
        self.currentTweetAuthor = data["user"];
        console.log("Updated");
        self.loading = false;
      });


    },
    checkAnswer: function(element) {
      if (!this.currentTweetAnswered) {
        // Get the username clicked
        var buttonClicked = element.target;
        var usernameSubmitted = buttonClicked.getAttribute("username");

        // Check is user is right
        var isRight = (usernameSubmitted === this.currentTweetAuthor);

        // Display message
        if (isRight) {
          this.currentTweetText = "Correct";
          this.score += 1;
        } else {
          this.currentTweetText = "Wrong."
          this.score += -1;
        }

        // Update button colours
        this.resetTweetDisplay();
        $("#usernameButtonRow button").addClass("incorrect");
        console.log($('*[username="' + this.currentTweetAuthor + '"]'))
        $('*[username="' + this.currentTweetAuthor + '"]').removeClass("incorrect").addClass("correct");
        // $(buttonClicked).removeClass("incorrect");
        // $(buttonClicked).addClass("correct");
        this.currentTweetAnswered = true
      } else {
        this.displayNextTweet();
        this.currentTweetAnswered = false
        this.resetTweetDisplay();
        this.$forceUpdate();
      }

    },
    resetTweetDisplay: function() {
      $("#usernameButtonRow button").removeClass("correct");
      $("#usernameButtonRow button").removeClass("incorrect");
    },

  }
})
