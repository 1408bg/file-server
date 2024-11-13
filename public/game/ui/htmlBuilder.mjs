// 1

import Color from "../graphic/color.mjs";
import Size from "../graphic/size.mjs";

class HTMLBuilder {
  static idCounter = 0;
  static head;

  constructor(tagName) {
    /**
    * @type {HTMLElement}
    */
    this.content = document.createElement(tagName);
  }

  /**
  * @param {Object} styles 
  * @returns {HTMLBuilder}
  */
  setStyles(styles) {
    Object.keys(styles).forEach(key => this.content.style[key] = styles[key]);
    return this;
  }

  /**
  * @param {Object} styles
  * @returns {HTMLBuilder}
  */
  setHoverStyles(styles) {
    if (!this.id) {
      this.id = `element-${HTMLBuilder.idCounter++}`;
      this.content.id = this.id;
    }

    if (!HTMLBuilder.head) {
      HTMLBuilder.head = document.createElement('style');
      document.head.appendChild(HTMLBuilder.head);
    }

    HTMLBuilder.head.textContent += `
      #${this.id}:hover {
        ${Object.entries(styles)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ')}
      }\n
    `;
    return this;
  }


  /**
  * @param {number} elevation - 그림자 깊이 (0~24)
  * @returns {HTMLBuilder}
  */
  setElevation(elevation) {
    if (elevation < 0 || elevation > 24) {
      elevation = 0;
    }
    const shadowSize = elevation * 2;
    const opacity = Math.max(0.1, 0.2 - elevation * 0.008);

    this.content.style.boxShadow = `0 ${shadowSize}px ${shadowSize * 2}px rgba(0, 0, 0, ${opacity})`;
    return this;
  }

  /**
  * @param {Color|string} color - 배경색
  * @returns {HTMLBuilder}
  */
  setBackgroundColor(color) {
    this.content.style.backgroundColor = color;
    return this;
  }

  /**
  * @param {Color|string} color 글자색
  * @returns 
  */
  setColor(color) {
    this.content.style.color = color;
    return this;
  }

  /**
  * @param {string} border - 테두리 스타일
  * @returns {HTMLBuilder}
  */
  setBorder(border) {
    this.content.style.border = border;
    return this;
  }

  /**
  * @param {string} padding - 내부 여백
  * @returns {HTMLBuilder}
  */
  setPadding(padding) {
    this.content.style.padding = padding;
    return this;
  }

  /**
  * @param {string} margin - 외부 여백
  * @returns {HTMLBuilder}
  */
  setMargin(margin) {
    this.content.style.margin = margin;
    return this;
  }

  /**
  * @param  {Object} attributes 
  * @returns {HTMLBuilder}
  */
  setAttributes(attributes) {
    Object.keys(attributes).forEach(key => this.content.setAttribute(key, attributes[key]));
    return this;
  }

  /**
  * @param  {Size} size 
  * @returns {HTMLBuilder}
  */
  setSize(size) {
    return this.setStyles({
      'width': `${size.width}px`,
      'height': `${size.height}px`
    });
  }

  setPosition(position) {
    return this.setStyles({
      'position': 'relative',
      'left': `${position.x}px`,
      'top': `${position.y}px`
    });
  }

  /**
  * @param {HTMLElement} child 
  * @returns {HTMLBuilder}
  */
  appendChild(child) {
    this.content.appendChild(
      child
    );
    return this;
  }

  /**
  * @param {String} text
  * @returns {HTMLBuilder}
  */
  setText(text) {
    this.content.textContent = text;
    return this;
  }

  /**
  * @param {number} layer z-index
  */
  setLayer(layer) {
    this.content.style.zIndex = layer;
    return this;
  }

  /**
  * @param {string} [justifyContent] 주축의 정렬
  * @param {string} [alignItems] 교차축의 정렬
  * @param {string} [direction] 축의 방향
  * @returns {HTMLBuilder}
  */
  flex(justifyContent = 'start', alignItems = 'start', direction = 'row') {
    return this.setStyles({
      'display': 'flex',
      'justify-content': justifyContent,
      'align-items': alignItems,
      'flex-direction': direction
    });
  }

  image(src, alt = 'img', objectFit = 'cover') {
    return this.setAttributes({
      'src': src,
      'alt': alt,
      'object-fix': objectFit
    });
  }

  onClick(callback) {
    this.content.addEventListener('click', (event) => {
      callback(event);
    });
    return this.setStyles({'cursor': 'pointer'});
  }

  build() {
    return this.content;
  }
}

export default HTMLBuilder;