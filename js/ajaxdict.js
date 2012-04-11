var language = "Latin";

var regex = new RegExp("<h2>.*" + language + ".*<\\/h2>([\\s\\S]*?)<h2>");
var regex2 = new RegExp("<h2>.*" + language + ".*<\\/h2>([\\s\\S]*)");

var baseURL = 'http://en.wiktionary.org';

function showPage(page, text) {
  var sourceurl = baseURL + '/wiki/' + page;
  $('#pagetitle').text(page);
  $('#wikiInfo').html(text);
  $('#sourceurl').attr('href', sourceurl);

  // now you can modify content of #wikiInfo as you like
  $('#wikiInfo').find('a:not(.references a):not(.extiw):not([href^="#"])').attr('href',
    function() {
      return baseURL + $(this).attr('href');
    }
  );
  // ...
}

function errorEntry(word) {
  $('#wikiInfo').html("An entry for the word \'" + word + "\' was not found in the " + language + " dictionary.");
}

$(document).ready(function() {
  $('#pagetitle').hide();
  $('#word').keyup(function() {

    var word = $(this).val();

    $('#wikiInfo').html("...loading dictionary entry for " + word + "...");

    $.getJSON(baseURL + '/w/api.php?action=parse&format=json&prop=text|' 
      + 'revid|displaytitle&callback=?&page=' + word,

      //Parsing the JSON
      function(json) {
        if (json.parse == null || json.parse.revid < 1) {
          errorEntry(word);
          return;
        }

        var text = json.parse.text['*'];

        //Match
        var match = regex.exec(text);
        if (match == null) {
          match = regex2.exec(text);
          if (match == null) {
            errorEntry(word);
            return;
          }
        }

        text = match[1];

        showPage(word, text);

      });
  });
});