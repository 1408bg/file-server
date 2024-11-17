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
const groundHeight = game.height/2+50;
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
    description: '이동 속도를 0.4 증가시킨다.',
    type: 3,
    value: 0.4,
    level: 1
  },
  {
    title: '가속+',
    description: '이동 속도를 0.8 증가시킨다.',
    type: 3,
    value: 0.8,
    level: 2
  },
  {
    title: '가속++',
    description: '이동 속도를 1.5 증가시킨다.',
    type: 3,
    value: 1.5,
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
  }
]
const enemys = [];
let boss;

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

/*
groundPrefab.instantiate(
  (e) => {
    e.position.y = groundHeight - 160;
    e.size.width *= 0.4;
    e.position.x = game.width/2 - e.size.width/2;
    return e;
  }
);
*/

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
    new Sandbag(
      game,
      new Position(x, groundHeight-10),
      (enemy) => {
        const index = enemys.findIndex((e)=>e===enemy);
        if (index !== -1) enemys.splice(index, 1);
      },
      5 + stage*5,
      25 + stage*25
    )
  );
  genCount++;
}

function genBoss() {
  boss = new Sandbag(
    game,
    new Position(-100, groundHeight-10),
    () => {
      boss = null;
      if (stage === 1) {
        const dialog = new AlertDialog(
          '무기 스킬 획득',
          '우클릭을 통하여 낫 투척 사용 가능',
          {
            actions: [
              {
                text: '확인',
                color: palette[2],
                onClick: () => {
                  player.canWeaponSkill = true;
                  dialog.close();
                  if (!player.isProcessingLevelUp) resume();
                }
              }
            ]
          }
        );
        dialog.show(game);
        pause();
        game.startCoroutine(stage2);
      } else {
        alert('야호 이겼다~!');
      }
    },
    10+stage*15,
    300+stage*300,
    4+stage,
    1.6,
    4,
    10
  );
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

if (1 | game.platform !== 'WEB') {
  const uiContainer = new HTMLBuilder('div')
  .setSize(new Size(game.width))
  .setLayer(31)
  .flex('center', 'center', 'row', 10)
  .setPosition(new Position(0, game.height-300))
  .append(
    new HTMLBuilder('div')
    .column(
      new HTMLBuilder('button')
      .button(
        'W',
        () => player.jump()
      ).build(),
      new HTMLBuilder('div')
      .row(
        new HTMLBuilder('button')
        .button(
          'A',
          () => player.moveLeft(),
          {
            onUp: () => player.stopLeft()
          }
        ).build(),
        new HTMLBuilder('button')
        .button(
          'D',
          () => player.moveRight(),
          {
            onUp: () => player.stopRight()
          }
        ).build()
      ).build(),
      new HTMLBuilder('button')
      .button(
        'D',
        () => player.dash()
      ).build()
    ).build(),
    new HTMLBuilder('button')
    .button(
      'L',
      () => player.attack()
    ).build(),
    new HTMLBuilder('button')
    .button(
      'R',
      () => player.weaponSkill()
    ).build()
  ).build();
  game.addElement(uiContainer);
}

game.addEntity(endText);
game.startCoroutine(stage1);