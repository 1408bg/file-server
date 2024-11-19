// 1

import Color from "../graphic/color.mjs";
import EdgeInsets from "../graphic/edgeInsets.mjs";
import Size from "../graphic/size.mjs";

class HTMLBuilder {
  static idCounter = 0;
  static head;
  static defaultPadding = EdgeInsets.symmetric({vertical: 12, horizontal: 24});

  constructor(tagName) {
    /**
    * @type {HTMLElement}
    */
    this.content = document.createElement(tagName);
  }

  static gap({width = 0, height = 0}) {
    return new HTMLBuilder('div').setSize(new Size(width, height)).build();
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
    const sizeStyle = {};
    if (size.width !== undefined) {
      sizeStyle['width'] = size.width+'px';
    }
    if (size.height !== undefined) {
      sizeStyle['height'] = size.height+'px';
    }
    return this.setStyles(sizeStyle);
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
    this.content.appendChild(child);
    return this;
  }

  /**
  * @param  {...HTMLElement} children 
  * @returns {HTMLBuilder}
  */
  append(...children) {
    children.forEach((child) => {
      this.content.appendChild(child);
    });
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
  * @param {number} [gap] 
  * @returns {HTMLBuilder}
  */
  flex(justifyContent = 'start', alignItems = 'start', direction = 'row', gap = 0) {
    return this.setStyles({
      'display': 'flex',
      'justify-content': justifyContent,
      'align-items': alignItems,
      'flex-direction': direction,
      'gap': `${gap}px`
    });
  }

  column(...children) {
    return this.setStyles({
      'display': 'flex',
      'flex-direction': 'column'
    })
    .append(...children);
  }
  
  row(...children) {
    return this.setStyles({
      'display': 'flex',
      'flex-direction': 'row'
    })
    .append(...children);
  }

  image(src, alt = 'img', objectFit = 'cover') {
    return this.setAttributes({
      'src': src,
      'alt': alt,
      'object-fit': objectFit
    });
  }

  onClick(onClick) {
    this.content.addEventListener('click', (event) => {
      onClick(event);
    });
    return this.setStyles({'cursor': 'pointer'});
  }

  /**
  * @param {string} text 버튼에 표시될 텍스트
  * @param {function} onDown 버튼 클릭 시 실행할 콜백 함수
  * @param {Object} [options] 버튼 스타일을 조정할 수 있는 옵션 객체
  * @returns {HTMLBuilder} Material 스타일이 적용된 텍스트 버튼을 포함한 HTMLBuilder 인스턴스
  */
  button(text, onDown, options = {}) {
    const defaultPadding = HTMLBuilder.defaultPadding;
    const defaultOptions = {
      backgroundColor: '#6200EE',
      color: 'white',
      elevation: 2,
      padding: `${defaultPadding.top}px ${defaultPadding.right}px ${defaultPadding.bottom}px ${defaultPadding.left}px`,
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none',
      onUp: null
    };

    const finalOptions = { ...defaultOptions, ...options };

    this.content.textContent = text;
    this.content.style.backgroundColor = finalOptions.backgroundColor;
    this.content.style.color = finalOptions.color;
    this.content.style.padding = finalOptions.padding;
    this.content.style.borderRadius = finalOptions.borderRadius;
    this.content.style.fontSize = finalOptions.fontSize;
    this.content.style.border = 'none';
    this.content.style.outline = 'none';
    this.content.style.cursor = finalOptions.cursor;
    this.setElevation(finalOptions.elevation, this.content);

    this.content.addEventListener('mousedown', onDown);
    this.content.addEventListener('touchstart', onDown);
    if (finalOptions.onUp) {
      this.content.addEventListener('mouseup', finalOptions.onUp);
      this.content.addEventListener('touchend', finalOptions.onUp);
      this.content.addEventListener('touchcancel', finalOptions.onUp);
    }
    return this;
  }

  build() {
    return this.content;
  }
}

export default HTMLBuilder;