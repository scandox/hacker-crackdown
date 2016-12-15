"use strict";

/* An extension solely for overriding default behaviour
   of Annotator Editor

*/
module.exports = function(e) {
  e._onTextareaKeydown = TextareaKeydown.bind(this);
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
