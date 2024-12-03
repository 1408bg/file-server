import { Color, Size, Vector } from '../../graphic/data.mjs';
import { Game, Scene, GameObject } from '../../engine/data.mjs';
import { waitForDuration, startCoroutine, stopCoroutine } from '../../system/coroutine.mjs';
import Prefab from '../../engine/prefab.mjs';
import Duration from '../../core/duration.mjs';
import Input from '../../system/input.mjs';
import ElementBuilder from '../../ui/builder.mjs';

function setupMainScene() {
  /** @type {Game} */
  const game = window.game;
  const mainScene = game.createScene('main');
  let score = 0;
  let canJump = false;
  let horizontalForce = Vector.zero;
  let verticalForce = Vector.zero;

  const player = GameObject.colored({
    position: new Vector({ x: game.width / 2, y: 0 }),
    color: Color.fromHex('#C3E2DD'),
    size: new Size({ width: 50, height: 50 })
  });

  const cloudPrefab = new Prefab({
    object: GameObject.colored({ color: Color.fromHex('#FFFFFFAF') })
  });

  if (game.platform !== 'WEB') {
    ElementBuilder.themeData.padding = '12px 24px';
    const leftButton = new ElementBuilder('button')
    .setText('➡️')
    .onPressStart(() => Input.addKeyDown('d'))
    .onPressEnd(() => Input.addKeyUp('d'))
    .setPosition(new Vector({ x: 150, y: game.height-80}))
    .asButton().build();
    const rightButton = new ElementBuilder('button')
    .setText('⬅️')
    .onPressStart(() => Input.addKeyDown('a'))
    .onPressEnd(() => Input.addKeyUp('a'))
    .setPosition(new Vector({ x: 0, y: game.height-80}))
    .asButton().build();
    const jumpButton = new ElementBuilder('button')
    .setText('⬆️')
    .onPressStart(() => Input.addKeyDown('w'))
    .onPressEnd(() => Input.addKeyUp('w'))
    .setPosition(new Vector({ x: game.width-250, y: game.height-80}))
    .asButton().build();
    mainScene.addElementAll({ elements: [leftButton, rightButton, jumpButton], layer: 10 });
  }

  function gameEnd() {
    game.loadSceneNamed({name: 'end', args: [score] });
  }
  
  function createCloud() {
    return cloudPrefab.instantiate({
      setupFunction: (cloud) => {
        cloud.position.x = Math.floor(Math.random() * (game.width - 100)) + 50;
        cloud.position.y = game.height;
        cloud.size = new Size({ width: Math.random() * 100 + 60, height: Math.random() * 50 + 30 });
        if (Math.random() > 1-(score / 1000)) {
          cloud.element.style.backgroundColor = '#666666AF';
          cloud.dark = true;
        }
        return cloud;
      }
    });
  }

  function moveClouds() {
    cloudPrefab.instances.forEach((cloud) => {
      cloud.position.y -= 1.6 + score / 100;
      if (cloud.position.y < 0) {
        cloudPrefab.destroy({ object: cloud });
        score++;
      } else {
        cloud.applyPosition();
      }
    });
  }

  function* createCloudLoop() {
    while (true) {
      const cloud = createCloud();
      mainScene.addObject({ object: cloud });
      yield waitForDuration(new Duration({ milisecond: 400 }));
    }
  }

  function* gravityLoop() {
    const GRAVITY = new Vector({ x: 0, y: 0.3 });
    verticalForce = Vector.zero;
    yield waitForDuration(new Duration({ second: 3 }));
    while (true) {
      verticalForce.add(GRAVITY);
      player.position.add(verticalForce);
      cloudPrefab.instances.forEach((cloud) => {
        if (player.isCollide(cloud)) {
          if (cloud.dark) cloudPrefab.destroy({ object: cloud });
          if (cloud.position.y + 10 < player.position.y + player.size.height) {
            player.position.add(GRAVITY);
          } else {
            player.position.y = cloud.position.y - player.size.height;
            canJump = true;
          }
          verticalForce = Vector.zero;
        }
      });
      yield null;
    }
  }

  function* gameLoop() {
    const speed = 5;
    while (true) {
      moveClouds();
      horizontalForce = Vector.zero;
      if (Input.getKey('a')) horizontalForce.x -= speed;
      if (Input.getKey('d')) horizontalForce.x += speed;
      if (Input.getKeyDown('w') || Input.getKeyDown(' ') && canJump) {
        verticalForce.y -= 10;
        canJump = false;
      }
      player.position.add(horizontalForce);
      
      player.applyPosition();

      if (!game.contains(player)) gameEnd();

      yield null;
    }
  }

  mainScene.addObject({ object: player });

  mainScene.onLoad = () => {
    player.position = new Vector({ x: game.width / 2, y: 0 });
    startCoroutine(gameLoop);
    startCoroutine(gravityLoop);
    startCoroutine(createCloudLoop);
  }
  
  mainScene.onUnload = () => {
    cloudPrefab.destroyAll();
    stopCoroutine(gameLoop);
    stopCoroutine(gravityLoop);
    stopCoroutine(createCloudLoop);
  };
}

export default setupMainScene;
