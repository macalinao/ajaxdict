var baseURL = 'http://en.wiktionary.org';

function handleSearch(word) {
  $.getJSON(baseURL + '/w/api.php?action=parse&format=json&prop=text|revid|displaytitle&callback=?&page=' + word, handleJsonResult);
}

function handleJsonResult(json) {
  if (json.parse === null || json.parse.revid < 1) {
    alert('no results');
  }

  var currentLanguage = 'Latin';
  var regex = new RegExp("<h2>.*" + currentLanguage + ".*<\\/h2>([\\s\\S]*?)<h2>");
  var regex2 = new RegExp("<h2>.*" + currentLanguage + ".*<\\/h2>([\\s\\S]*)");

  var text = json.parse.text['*'];
  var match = regex.exec(text);
  if (match == null) {
    match = regex2.exec(text);
    if (match == null) {
      alert('no results');
      return;
    }
  }
  
  var $content = $('<div>' + match[0] + '</div');
  parseContent($content);
  $('#results').html($content.html());
}

function parseContent(content) {
  content.find('h2').remove(); // don't need language
  content.find('.mw-editsection, img').remove();
  content.find('a').contents().unwrap(); // Remove links
}

function errorEntry(language, word) {
  $('#wikiInfo').html("An entry for the word \'" + word + "\' was not found in the " + language + " dictionary.");
}

$(function() {

  // Word textbox stuff
  var $word = $('#word');
  $word.focus();
  $word.focus(function() {
    $(this).select();
  });
  $word.keyup(function(e) {
    if (e.which === 27) {
      $word.blur();
    }
  });
  $(document).keydown(function() {
    if (!$word.is(':focus')) {
      $word.focus();
    }
  });

  // Handle search enter
  $word.keydown(function(e) {
    if (e.which === 13) {
      handleSearch($word.val());
    }
  });

});
