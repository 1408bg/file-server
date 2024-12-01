// 2

import Entity from "../entity/entity.mjs";
import Color from "../graphic/color.mjs";
import EdgeInsets from "../graphic/edgeInsets.mjs";
import Position from "../graphic/position.mjs";
import Text from "./text.mjs";


class TextInput extends Entity {
  /**
  * 글자를 content로 가지는 버튼을 생성합니다.
  * @param {Text} text 글자
  * @param {Color} color
  * @param {EdgeInsets} padding
  */
  constructor(text, color = new Color(0, 0, 0, 1), padding = EdgeInsets.fromJson({left: 10, right: 10, top: 10, bottom: 10})) {
    super(text.position, text.size, text, 10);
    text.position = new Position(padding.left, padding.top);
    this.isFocus = false;
    this.color = color;
    this.padding = padding;
    /**
    * @type {Function}
    */
    this.text = ()=>text;
    this.clickHandler = () => this.isFocus = !this.isFocus;
  }

  render() {
    const entity = document.createElement('div');
    entity.style.position = 'absolute';
    entity.style.width = `${this.text().size.width}px`;
    entity.style.height = `${this.text().size.height}px`;
    entity.style.left = `${this.position.x}px`;
    entity.style.top = `${this.position.y}px`;
    entity.style.padding = `${this.padding.top}px ${this.padding.right}px ${this.padding.bottom}px ${this.padding.left}px`;
    entity.style.zIndex = this.layer;
    entity.style.backgroundColor = this.color.toString();

    entity.appendChild(this.text().render());

    this.element = entity;
    entity.addEventListener('click', this.handleClick);
    this.keyboardEventListener = document.querySelector('.__rnini_root__').game.addKeyboardEventListener(async (type, event) => {
      if (type === 'keydown' && this.isFocus) {
        if (event.key === 'Backspace') {
          this.text().setText(this.text().getText().slice(0, this.text().getText().length - 1));
        } else {
          if (event.ctrlKey && event.key.toLowerCase() === 'v') 
            this.text().addText(await navigator.clipboard.readText());
          else if (event.key.length <= 1)
            this.text().addText(event.key);
        }
        this.size = this.text().size;
      }
    });
    return entity;
  }

  /**
  * 요소의 가시성을 변경합니다.
  * @param {bool} visible 가시성
  */
  visibility(visible) {
    this.text().visibility(visible);
  }

  /**
  * 자신을 제거합니다.
  */
  destroy() {
    if (this.element) {
      document.querySelector('.__rnini_root__').game.removeKeyboardEventListener(this.keyboardEventListener);
      this.element.removeEventListener('click', this.clickHandler);
    }
    super.destroy();
  }
}

export default TextInput;