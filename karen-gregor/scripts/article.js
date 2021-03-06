'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// PUT YOUR RESPONSE HERE
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // This is a ternary operator.  The statement before the ? is checked to see if it's true (is there a publish date).  If it is, the code btw '?' and ':' is run (calc days since publication), else the code after ':' is run (draft).
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// 'rawData' is a function. Now it is attached to the constructor function.It is called in Article.fetchAll.
Article.loadAll = rawData => {
  //console.log('rawData', rawData);
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)));
  //console.log('Article.all', Article.all);
  articleView.initIndexPage(); //Loading the articles to index.html
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {

    //stretch goal. Using AJAX HEAD request to check the ETag value without looking at the full file
    $.ajax({
      type: 'HEAD', url: 'data/hackerIpsum.json', complete: function(xhr) {
        let ETag = xhr.getResponseHeader('ETag');
        console.log(`current ETag: ${localStorage.ETag}, latest ETag: ${ETag}`);
        localStorage.ETag === ETag ? Article.loadAll(JSON.parse(localStorage.rawData)) : retrieveJSON();
      }
    });

    // Article.loadAll(JSON.parse(localStorage.rawData)); basic solution
  } else {
    //COMMENT:  First, we retrieve date from JSON file.  Then load the data into the Article.all array by calling .loadall function. Last, store in localStorage.
    retrieveJSON();
  }

  function retrieveJSON() {
    $.getJSON('data/hackerIpsum.json', function (data, message, xhr) {
    //  console.log(xhr);
      console.log('retrieving JSON')
    })
      .done(function (data, message, xhr) {
        Article.loadAll(data);
        localStorage.rawData=JSON.stringify(data); //Storing data to localStorage
        localStorage.ETag=xhr.getResponseHeader('ETag');
        console.log('ETag',localStorage.ETag);
        console.log('Done');
      });
  }
}