"use strict";

var $ = require('jquery');

/* An extension solely for overriding default behaviour
   of Annotator Editor

*/
module.exports = function(e) {
  e._onTextareaKeydown = TextareaKeydown.bind(e);
  e._original_submit = e.submit;
  e.submit = submit.bind(e);
}

function submit() {
  var textarea= $(this.element).find("textarea").first();
  var text = textarea.val();
  if (text.length === 0) {
    textarea.parent().children('p').remove();
    textarea.parent().append('<p style="color:red">Speak your mind, consequences be damned.</p>');
    textarea.on('keydown', function() {
      textarea.parent().children('p').remove();
    });
  }else{
    return this._original_submit();
  }
}

// Editor textarea keyboard shortcuts.
// Revise default annotator shortcut to map shift+enter to save
// instead of just enter. Credit: stole this from annotator-meltdown
function TextareaKeydown(event) {
  if (event.which === 27) {
    // "Escape" key => abort.
    this.cancel();
  } else if (event.which === 13 && event.shiftKey) {
    // If "return" was pressed *with*the shift key, we're done.
    this.submit();
  }
}
