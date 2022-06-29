// IIFE keeps our variables private
// and gets executed immediately!
(function () {
  // make doc editable and focus
  var doc = document.getElementById('doc');
  doc.contentEditable = true;
  doc.focus();

  var doc2 = document.getElementById('doc2');
  doc2.contentEditable = true;
  doc2.focus();

  // if this is a new doc, generate a unique identifier
  // append it as a query param
  var id = getUrlParameter('id');
  if (!id) {
    location.search = location.search
      ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
    return;
  }

  return new Promise(function (resolve, reject) {
    // subscribe to the changes via Pusher
    var pusher = new Pusher('6780742e5e8b3e07326f', { cluster: 'us2' });
    var channel = pusher.subscribe(id);
    var presenceChannel = pusher.subscribe("presence-quickstart" + id);



    presenceChannel.bind("pusher:subscription_succeeded", () =>
      presenceChannel.members.each((member) => addMemberToUserList(member.id))
    );
    presenceChannel.bind("pusher:member_added", (member) =>
      addMemberToUserList(member.id)
    );
    presenceChannel.bind("pusher:member_removed", (member) => {
      const userEl = document.getElementById(member.id);
      userEl.parentNode.removeChild(userEl);
    });

  


    channel.bind('client-text-edit', function(html) {
      // save the current position
     
      var currentCursorPosition = getCaretCharacterOffsetWithin(doc);
      doc.innerHTML = html;
      // set the previous cursor position
      setCaretPosition(doc, currentCursorPosition);
      
    
    });
    channel.bind('pusher:subscription_succeeded', function() {
      resolve(channel);
    });
    channel.bind('client-text-edit2', function(html) {
      // save the current position
      
      var currentCursorPosition2 = getCaretCharacterOffsetWithin(doc2);
      doc2.innerHTML = html;
      // set the previous cursor position
      setCaretPosition(doc2, currentCursorPosition2);
      
    });
    channel.bind('pusher:subscription_succeeded', function() {
      resolve(channel);
    });
  }).then(function (channel) {
    function triggerChange (e) {
      if(e.target.id == 'doc'){
        channel.trigger('client-text-edit', doc.innerHTML);


      }else{
      channel.trigger('client-text-edit2', doc2.innerHTML);
      }
    }

    doc.addEventListener('input', triggerChange);
    doc2.addEventListener('input', triggerChange);

    
  })

  function addMemberToUserList(memberId) {


    userEl = document.createElement("div");
    userEl.id = memberId;
    userEl.innerText = memberId;
    document.getElementById("user_list").appendChild(userEl);

    console.log = memberId.name;
  }

  // a unique random key generator
  function getUniqueId () {
    return 'private-' + Math.random().toString(36).substr(2, 9);
  }


  // function to get a query param's value
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  function setCaretPosition(el, pos) {
    // Loop through all child nodes
    for (var node of el.childNodes) {
      if (node.nodeType == 3) { // we have a text node
        if (node.length >= pos) {
            // finally add our range
            var range = document.createRange(),
                sel = window.getSelection();
            range.setStart(node,pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return -1; // we are done
        } else {
          pos -= node.length;
        }
      } else {
        pos = setCaretPosition(node,pos);
        if (pos == -1) {
            return -1; // no need to finish the for loop
        }
      }
    }
    return pos; // needed because of recursion stuff
  }
})();