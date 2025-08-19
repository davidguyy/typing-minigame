import './index.css';
import { GAME_HEIGHT, GAME_WIDTH } from "../../globals";
import kaplay from 'kaplay'
import { colyseusSDK } from "./core/colyseus";
import { createLobbyScene } from './scenes/lobby';
import type { MyRoomState } from '../../server/src/rooms/schema/MyRoomState';

const font = "happy-o";

// Initialize kaplay
export const k = kaplay({
  focus: true,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  pixelDensity: Math.min(window.devicePixelRatio, 2), // crispier on phones
  background: "8db7ff",
  font: font,
});

// Create all scenes
createLobbyScene();

async function main() {
  await k.loadBitmapFont(font, "./assets/happy-o.png", 31, 39);
  await k.loadSound("score", "./assets/score.mp3");
  await k.loadSound("whooosh", "./assets/wooosh.mp3");

  const text = k.add([
    k.text("Joining room ...", { size: 28 }),
    k.pos(k.center()),
    k.anchor("center")
  ]);

  const room = await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
    name: "Ka"
  });

  text.text = "Success! sessionId: " + room.sessionId;

  k.go("lobby", room);
}

main();
