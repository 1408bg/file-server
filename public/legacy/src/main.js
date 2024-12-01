import Game from '../game.mjs';
import { Entity, Prefab } from '../entity/data.mjs';
import { Size, Position, Color } from '../graphic/data.mjs';
import { AlertDialog, Text } from '../ui/data.mjs';
import Player from './player.js';
import Sandbag from './enemies/sandbag.js';
import waitForDuration from '../util/coroutine.mjs';
import Duration from '../util/duration.mjs';
import HTMLBuilder from '../ui/htmlBuilder.mjs';

const root = document.querySelector('#game');
const game = new Game(root);

let playing = true;
let genCount = 0;
let stage = 1;
const groundHeight = game.height/2+150;
const palette = [
  Color.fromHex('#999999'),
  Color.fromHex('#4CEDE5'),
  Color.fromHex('#8650AC')
];
const options = [
  {
    title: '공격력 증가',
    description: '공격력을 2 증가시킨다.',
    type: 1,
    value: 2,
    level: 1
  },
  {
    title: '공격력 증가+',
    description: '공격력을 3 증가시킨다.',
    type: 1,
    value: 3,
    level: 2
  },
  {
    title: '공격력 증가++',
    description: '공격력을 5 증가시킨다.',
    type: 1,
    value: 5,
    level: 3
  },
  {
    title: '내구도 증가',
    description: '최대체력을 15 증가시킨다.',
    type: 2,
    value: 10,
    level: 1
  },
  {
    title: '내구도 증가+',
    description: '최대체력을 30 증가시킨다.',
    type: 2,
    value: 25,
    level: 2
  },
  {
    title: '내구도 증가++',
    description: '최대체력을 60 증가시킨다.',
    type: 2,
    value: 50,
    level: 3
  },
  {
    title: '가속',
    description: '이동 속도를 0.2 증가시킨다.',
    type: 3,
    value: 0.2,
    level: 1
  },
  {
    title: '가속+',
    description: '이동 속도를 0.4 증가시킨다.',
    type: 3,
    value: 0.4,
    level: 2
  },
  {
    title: '가속++',
    description: '이동 속도를 0.8 증가시킨다.',
    type: 3,
    value: 0.8,
    level: 3
  },
  {
    title: '회복',
    description: '체력을 전부 회복합니다.',
    type: 4,
    value: NaN,
    level: 2
  },
  {
    title: '광폭화',
    description: '최대체력을 30% 경감하고 공격력을 20% 증가시킨다.',
    type: 5,
    value: [0.7, 1.2],
    level: 1
  },
  {
    title: '광폭화+',
    description: '최대체력을 40% 경감하고 공격력을 50% 증가시킨다.',
    type: 5,
    value: [0.6, 1.5],
    level: 2
  },
  {
    title: '광폭화++',
    description: '최대체력을 50% 경감하고 공격력을 80% 증가시킨다.',
    type: 5,
    value: [0.5, 1.8],
    level: 3
  },
  {
    title: '재생',
    description: '초당 체력을 0.5 회복한다.',
    type: 6,
    value: 0.5,
    level: 1
  },
  {
    title: '재생+',
    description: '초당 체력을 1 회복한다.',
    type: 6,
    value: 1,
    level: 2
  },
  {
    title: '재생++',
    description: '초당 체력을 2 회복한다.',
    type: 6,
    value: 2,
    level: 3
  }
]
const enemys = [];
let boss;
let regenerative = 0;

const groundPrefab = new Prefab(
  new Entity(
    new Position(0, 0),
    new Size(game.width, 10),
    Color.fromHex('#777777')
  ),
  game
);

groundPrefab.instantiate(
  (e) => {
    e.position.y = groundHeight + 10;
    return e;
  }
);

game.groundPrefab = groundPrefab;

const endText = new Text(
  new Position(game.width/2 - 128, game.height/2 - 96),
  'game end',
  undefined,
  '64px'
);

endText.visibility(false);

function pause() {
  player.pause();
  if (boss) {
    boss.pause();
  }
  const enemyLength = enemys.length;
  for (let i = 0; i < enemyLength; i++) {
    enemys[i].pause();
  }
  playing = false;
}

function resume() {
  player.resume();
  if (boss) {
    boss.resume();
  }
  const enemyLength = enemys.length;
  for (let i = 0; i < enemyLength; i++) {
    enemys[i].resume();
  }
  playing = true;
}

function onEnd() {
  endText.visibility(true);
  game.destroy();
}

const onLevelUp = async () => {
  pause();
  return new Promise((resolve) => {
    const cardContainer = new HTMLBuilder('div')
    .setStyles({
      'display': 'flex',
      'flex-direction': 'row',
      'gap': '16px',
      'padding': '16px'
    })
    .setPosition(new Position((game.width - 664)/2, game.height/2 - 100))
    .build();

    for (let i = 0; i < 3; i++) {
      const index = Math.floor(Math.random()*options.length);
      const card = new HTMLBuilder('div')
      .setStyles({
        'background-color': Color.fromHex('#B2B2B2'),
        'padding': '16px',
        'width': '200px',
        'border': `3px solid ${palette[options[index].level-1]}`,
        'transition': 'all 0.5s',
      })
      .setElevation(3)
      .setText(options[index].title)
      .appendChild(
        new HTMLBuilder('p')
        .setText(options[index].description)
        .build()
      )
      .setHoverStyles({
        'transform': 'scale(1.05)'
      })
      .onClick(()=>{
        resume();
        const option = options[index];
        switch(option.type) {
          case 1:
            player.weapon.damage += option.value;
            break;
          case 2:
            player.maxHealth += option.value;
            player.addHealth(option.value);
            break;
          case 3:
            player.moveSpeed += option.value;
            break;
          case 4:
            player.clearHealth();
            break;
          case 5:
            player.maxHealth *= option.value[0];
            player.weapon.damage *= option.value[1];
            player.addHealth(-player.health*option.value[0]);
            break;
          case 6:
            regenerative += option.value;
            break;
        }
        game.removeElement(overlay);
        resolve();
      })
      .build();

      cardContainer.appendChild(card);
    }
    const overlay = new HTMLBuilder('div')
    .setPosition(new Position(0, 0))
    .setSize(new Size(game.width, game.height))
    .setStyles({
      'position': 'fixed'
    })
    .setBackgroundColor(new Color(0, 0, 0, 0.4))
    .appendChild(cardContainer)
    .setLayer(30)
    .build();

    game.addElement(overlay);
  });
}

const player = new Player(
  game,
  new Position(game.width/2, groundHeight-10),
  groundHeight,
  onEnd,
  onLevelUp
);

function genEnemy(x) {
  enemys.push(
    new Sandbag({
      game: game,
      position: new Position(x, groundHeight-10),
      onDead: (enemy) => {
        const index = enemys.findIndex((e)=>e===enemy);
        if (index !== -1) enemys.splice(index, 1);
      },
      damage: 5 + stage*5,
      health: 25 + stage*25,
      moveSpeed: 4.2
    })
  );
  genCount++;
}

function genBoss() {
  boss = new Sandbag({
    game: game,
    position: new Position(-100, groundHeight-10),
    onDead: () => {
      boss = null;
      if (stage === 1) {
        game.startCoroutine(stage2);
      } else {
        alert('야호 이겼다~!');
      }
    },
    damage: 10 + stage*15,
    health: 300 + stage*300,
    weight: 4 + stage,
    factor: 1.6,
    moveSpeed: 5,
    exp: 10
  });
}

function *stage1() {
  stage = 1;
  while (genCount < 10){
    if (enemys.length < 10 && playing) {
      genEnemy(game.width + 100);
      genEnemy(-100);
    }
    yield waitForDuration(new Duration({second: 6}));
  }
  while (enemys.length > 0) {
    yield null;
  }
  genBoss();
}

function *stage2() {
  genCount = 0;
  stage = 2;
  while (genCount < 30) {
    if (playing) {
      genEnemy(game.width + 100);
      genEnemy(-100);
    }
    yield waitForDuration(new Duration({milisecond: 250}));
  }
  while (enemys.length > 0) {
    yield null;
  }
  genBoss();
}

function *regeneration() {
  while (true) {
    player.addHealth(regenerative);
    yield waitForDuration(new Duration({second: 1}));
  }
}

game.addEntity(endText);
game.startCoroutine(stage1);
game.startCoroutine(regeneration);