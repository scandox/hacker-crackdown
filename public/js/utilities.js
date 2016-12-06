'use strict';

var utilities = {

  hasStorage: function() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch(e) {
    return false;
    }
  },

  /* Returns current pathname
  
     If the path is '/' returns '/index.html'
  */
  currentPathname: function() {
    var pathname = window.location.pathname;
    if (pathname === '/') {
      return '/index.html';
    }
    return pathname;
  }

};

module.exports = utilities;
