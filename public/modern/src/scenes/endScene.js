import { Size, Vector } from '../../graphic/data.mjs';
import { Game, Scene, GameObject } from '../../engine/data.mjs';
import ElementBuilder from '../../ui/builder.mjs';
import Text from '../../ui/text.mjs';

function setupEndScene() {
  /** @type {Game} */
  const game = window.game;
  const endScene = game.createScene('end');
  
  const endText = new Text({
    text: '게임 종료',
    position: new Vector({ x: game.width / 2, y: game.height / 2 - 80 })
  });
  
  const restartButton = new GameObject({
    element: new ElementBuilder('button')
    .setText('재시작')
    .asButton()
    .setStyle({
      color: 'skyblue',
      transition: 'transform 0.5s'
    })
    .onHover((_, e) => e.style.transform = 'translate(-50%, -50%) scale(1.05)')
    .onHoverOut((_, e) => e.style.transform = 'translate(-50%, -50%)')
    .center()
    .onPress(() => game.loadSceneNamed({ name: 'main' }))
    .build(),
    position: new Vector({ x: game.width / 2, y: game.height / 2 })
  });
  
  endScene.addObjectAll({ objects: [endText, restartButton] });

  endScene.onLoad = (score) => {
    endText.setText(`게임종료\n점수: ${score}점`);
    endText.setFontSize(20);
  }
}

export default setupEndScene;