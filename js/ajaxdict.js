var currentLanguage = "Latin";
var regex;
var regex2;

var baseURL = 'http://en.wiktionary.org';

function errorEntry(language, word) {
  $('#wikiInfo').html("An entry for the word \'" + word + "\' was not found in the " + language + " dictionary.");
}

function updateRegex() {
  regex = new RegExp("<h2>.*" + currentLanguage + ".*<\\/h2>([\\s\\S]*?)<h2>");
  regex2 = new RegExp("<h2>.*" + currentLanguage + ".*<\\/h2>([\\s\\S]*)");
}

//Sets the page.
function setPage(language, word) {
  if (currentLanguage != language) {
    currentLanguage = language;
    updateRegex();
  }

  setHash(language, word);

  $('#wikiInfo').html("...loading dictionary entry for " + word + "...");

  $.getJSON(baseURL + '/w/api.php?action=parse&format=json&prop=text|' 
    + 'revid|displaytitle&callback=?&page=' + word,

    //Parsing the JSON
    function(json) {
      if (json.parse == null || json.parse.revid < 1) {
        errorEntry(language, word);
        return;
      }

      var text = json.parse.text['*'];

      //Match
      var match = regex.exec(text);
      if (match == null) {
        match = regex2.exec(text);
        if (match == null) {
          errorEntry(language, word);
          return;
        }
      }

      text = match[1];

      var sourceurl = baseURL + '/wiki/' + word;
      $('#pagetitle').text(word);
      $('#wikiInfo').html(text);
      $('#sourceurl').attr('href', sourceurl);

      // now you can modify content of #wikiInfo as you like
      $('#wikiInfo').find('a:not(.references a):not(.extiw):not([href^="#"])').attr('href',
        function() {
          return baseURL + $(this).attr('href');
        }
      );
  });
}

function getPageFromHash() {
  if (location.hash.length < 3) {
    return null;
  }

  var usable = location.hash.substring(3);

  var parts = usable.split("/");
  if (parts.length < 2) {
    return null;
  }

  return {
    language: parts[0],
    word: parts[1]
  }
}

function setHash(language, word) {
  location.hash = "!/" + language + "/" + word;
}

$(document).ready(function() {
  updateRegex();

  $('#pagetitle').hide();
  $('#word').keyup(function() {
    var word = $(this).val();
    setPage(currentLanguage, word);
  });

  var hash = getPageFromHash();
  if (hash == null) {
    return;
  }

  setPage(hash.language, hash.word);
});

