Element.js
===========

## About

Element.js creates or wraps dom elements in a convenient API
and uses an internal object pool and cached property values
for memory managment and performance.  

## Usage

### Create instances

```
var body = new Element(document.body);  // wraps document.body in an Element instance

var div = new Element(); // creates a 'div' element
div.id = 'someDiv';
div.group = 'someGroup';

var span = new Element('span');  // creates a 'span' element
span.group = 'someGroup';
```

### Get elements by id/group

```
Element.getElementById('someDiv');  // returns div without polling the dom tree
Element.getElementsByGroup('someGroup'); // returns array: [div, span] without polling the dom tree
```

### Add children to body

```
body.add(div, span); // adds div and span as children of body
```

### Remove children from body

```
body.remove(div, span); // removes div and span from body
```

### Add/remove listeners
```
body.listen('mousemove', mouseMoveCallback); // mapped to .addEventListener
body.ignore('mousemove', mouseMoveCallback); // mapped to .removeEventListener
```
### Set text

```
span.html = 'here is some text in a span';  // could also use html string, but not recommended
```

### Set styles

```
div.left = 100; // positioning is absolute by default
div.top = 100;
div.width = 50;  // number values assume pixels
div.height = 50;
div.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // color values accept all css string values
```

### Set/get/remove attributes

```
div.setAttribute('contenteditable', true);
div.getAttribute('style');
div.removeAttribute('data-id');
```
