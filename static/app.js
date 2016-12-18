var htmlEncoding = (function() {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;'     :   '&',
            '&gt;'      :   '>',
            '&lt;'      :   '<',
            '&quot;'    :   '"',
            '&#39;'     :   "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value){
        var htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();

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
    loading: false,
    errorText: '',
    unsuccsful_runs: 0
  },
  methods: {
    usernameFormButton: function() {
      if (this.username1 == '' || this.username2 == '') {
        this.errorText = 'Usernames cannot be empty.'
      }
      else if (this.username1 != this.username2) {
        this.showTweetDisplay = true;
        this.showUsernameForm = false;
        this.errorText = null;
        this.displayNextTweet();
      } else {
        this.errorText = "Usernames cannot be the same."
      }
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
      self.currentTweetText = "";
      // Make AJAX request
      self.loading = true;
      $.ajax(
        {
          url: "/api/random_twitter?userA=" + self.username1 + "&userB=" + self.username2
        }
      ).done(function(data) {
        // Update currentTweet object
        if (data.error) {
          self.errorText = data.error;
          if (data.error == "invalid names") {
            loading = false;
            self.tryDifferentUsersButton();
          }

          if (data.error == "tweet not found") {
            loading = false;
            self.unsuccsful_runs += 1;

            if (self.unsuccsful_runs >= 5) {
              alert("Too many failed attempts to find a tweet, changing users");
              self.unsuccsful_runs = 0;
              self.errorText = null;
              self.tryDifferentUsersButton();
            } else {
              self.nextTweetButton();
            }
          }
        } else {
          self.unsuccsful_runs = 0;
          self.errorText = null;
          self.currentTweetText = htmlEncoding.htmlDecode(data["tweet"]);
          self.currentTweetAuthor = data["user"];
        }
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
