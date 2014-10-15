var baseURL = 'http://en.wiktionary.org';
var languages = ['English', 'Latin', 'Spanish'];

function handleSearch(word) {
  $.getJSON(baseURL + '/w/api.php?action=parse&format=json&prop=text|revid|displaytitle&callback=?&page=' + word, handleJsonResult);
}

function handleJsonResult(json) {
  if (!json.parse || json.parse.revid < 1) {
    alert('no results');
  }

  var currentLanguage = $('#language').text();
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
  content.find('.mw-editsection, img, hr, h2').remove();

  // Remove references
  content.find('span#References').parent().remove();
  content.find('.references').remove();

  // Remove any weird styling
  content.find('*').removeAttr('style');

  content.find('a').contents().unwrap(); // Remove links
}

function errorEntry(language, word) {
  $('#wikiInfo').html("An entry for the word \'" + word + "\' was not found in the " + language + " dictionary.");
}

$(function() {

  // language selector
  var $lang = $('#languagePanel ul');
  $lang.html('');
  $.each(languages, function(i, lang) {
    var opt = $('<li><a href="#">' + lang + '</a></li>');
    opt.click(function() {
      $('#language').text(lang);
    });
    $lang.append(opt);
  });

  // Word textbox stuff
  var $word = $('#word');
  $word.focus(function() {
    $(this).select();
  });
  $word.keyup(function(e) {
    if (e.which === 27) {
      $word.blur();
    }
  });

  // Handle search box page showing
  $(document).keydown(function(e) {
    if ($word.hasClass('word-out')) {
      return;
    }
    switch (e.which) {
      case 27:
        return;
    }
    showSearchBoxPage();
    $word.focus();
  });

  // Handle search box page hiding
  $word.blur(function() {
    if ($('#results').text().trim()) {
      return;
    }
    $word.val('');
    hideSearchBoxPage();
  });

  // Handle search enter
  $word.keydown(function(e) {
    if (e.which === 13) {
      handleSearch($word.val());
    }
  })

  $(document).keydown(function(e) {
    if (e.which === 27 && $('#content').hasClass('content-out')) {
      hideSearchBoxPage();
    }
  });
});

function showSearchBoxPage() {
  $('#intro').removeClass('intro-in').addClass('intro-out');
  $('#content').removeClass('content-in').addClass('content-out');
  $('#word').removeClass('word-in').addClass('word-out');
}

function hideSearchBoxPage() {
  $('#intro').removeClass('intro-out').addClass('intro-in');
  $('#content').removeClass('content-out').addClass('content-in');
  $('#word').removeClass('word-out').addClass('word-in');
  $('#results').html('');
}
