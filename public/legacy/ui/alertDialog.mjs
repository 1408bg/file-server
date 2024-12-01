// 3

import { Decoratable } from "../entity/data.mjs";
import { Color, Position, Size } from "../graphic/data.mjs";
import { Text, TextButton } from "./data.mjs";
import { Duration, waitForDuration, Lerp } from "../util/data.mjs";
import { animate } from "../graphic/data.mjs";

class AlertDialog extends Decoratable {
  constructor(title, message, options = {}) {
    const {
      backgroundColor = Color.fromRGB(255, 255, 255),
      duration = null,
      titleFontSize = "20px", 
      messageFontSize = "16px",
      titleColor = Color.fromRGB(33, 33, 33),
      messageColor = Color.fromRGB(117, 117, 117),
      actions = []
    } = options;

    const titleText = new Text(
      new Position(24, 20),
      title,
      null,
      titleFontSize,
      "500",
      titleColor
    );

    const messageText = new Text(
      new Position(24, 60),
      message,
      null,
      messageFontSize,
      "400", 
      messageColor
    );

    const width = Math.max(titleText.size.width, messageText.size.width) + 48;
    const height = 100 + (actions.length > 0 ? 52 : 0);
    const size = new Size(width, height);

    super(new Position(0, 0), size, backgroundColor, 300);
    
    this.title = titleText;
    this.message = messageText;
    this.duration = duration;
    this.actions = [];
    this.overlay = null;

    this.layer = 32;
    this.title.layer = 33;
    this.message.layer = 33;
    
    this.setStyle('border-radius', '4px');
    this.setStyle('box-shadow', '0 8px 16px rgba(0,0,0,0.15)');
    this.setStyle('opacity', '0');
    this.setStyle('transform', 'scale(0.8)');
    
    if (actions.length > 0) {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.bottom = '8px';
      buttonContainer.style.right = '8px';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '8px';

      actions.forEach((action, index) => {
        const button = new TextButton(
          new Text(
            new Position(0, 0),
            action.text,
            null,
            "14px",
            "500",
            action.color || Color.fromRGB(33, 150, 243)
          ),
          () => {
            action.onClick();
            this.close();
          },
          {
            backgroundColor: Color.transparent()
          }
        );
        button.layer = 33;
        this.actions.push(button);
      });
    }
  }

  show(game) {
    if (!this.game) {
      const overlay = new Decoratable(
        new Position(0, 0),
        new Size(game.width, game.height),
        Color.fromRGB(0, 0, 0, 0.5),
        300
      );
      overlay.layer = 31;
      overlay.setStyle('opacity', '0');
      
      this.game = game;
      this.overlay = overlay;
      
      this.position.x = (game.width - this.size.width) / 2;
      this.position.y = (game.height - this.size.height) / 2;

      this.title.position.x += this.position.x;
      this.title.position.y += this.position.y;
      this.message.position.x += this.position.x;
      this.message.position.y += this.position.y;

      this.actions.forEach((button, index) => {
        button.position.x = this.position.x + this.size.width - ((index + 1) * 100) - 8;
        button.position.y = this.position.y + this.size.height - 40;
      });
      
      game.addEntity(overlay);
      game.addEntity(this);
      game.addEntity(this.title);
      game.addEntity(this.message);
      
      this.actions.forEach(button => game.addEntity(button));

      if (this.duration) {
        this.autoCloseCoroutine = game.startCoroutine(this.autoClose.bind(this));
      }

      animate(0, 1, Lerp.easeOutQuad, new Duration({ milisecond: 300 }), 
        (value) => {
          this.setStyle('opacity', value.toString());
          this.setStyle('transform', `scale(${0.8 + (0.2 * value)})`);
          overlay.setStyle('opacity', (value * 0.5).toString());
        }
      );
    }
  }

  close() {
    if (!this.game) return;
    
    animate(1, 0, Lerp.easeOutQuad, new Duration({ milisecond: 200 }), 
      (value) => {
        this.setStyle('opacity', value.toString());
        this.setStyle('transform', `scale(${0.8 + (0.2 * value)})`);
        if (this.overlay) {
          this.overlay.setStyle('opacity', (value * 0.5).toString());
        }
      },
      () => {
        this.title.visibility(false);
        this.message.visibility(false);
        this.actions.forEach(button => button.visibility(false));
        this.overlay.visibility(false);
        this.visibility(false);
        
        if (this.game && this.duration) {
          this.game.stopCoroutine(this.autoCloseCoroutine);
          this.autoCloseCoroutine = null;
        }
        
        this.game = null;
      }
    );
  }

  destroy() {
    if (this.game && this.duration) {
      this.game.stopCoroutine(this.autoCloseCoroutine);
      this.autoCloseCoroutine = null;
    }

    if (this.game) {
      if (this.title) {
        this.game.removeEntity(this.title);
        this.title = null;
      }
      if (this.message) {
        this.game.removeEntity(this.message);
        this.message = null;
      }
      if (this.actions.length > 0) {
        this.actions.forEach(button => {
          if (button) {
            this.game.removeEntity(button);
          }
        });
        this.actions = [];
      }
      if (this.overlay) {
        this.game.removeEntity(this.overlay);
        this.overlay = null;
      }
      
      this.game.removeEntity(this);
      this.game = null;
    }

    super.destroy();
  }

  /**
   * 대화 상자를 자동으로 닫습니다.
   */
  *autoClose() {
    yield waitForDuration(this.duration);
    this.close();
  }
}

export default AlertDialog; 