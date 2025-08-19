import { k } from "../App";
import player from "../objs/player";
import score from "../objs/score";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    k.add(score(room));
    const $ = getStateCallbacks(room);

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added in server state
    $(room.state).players.onAdd(async (player, sessionId) => {
      var question = k.add([
        k.pos(k.width() / 2, 100),
        k.text(room.state.question, {
          // Responsive friendly
          align: "center",
          width: k.width(),
        }),
        k.anchor("top"),
      ]);

      var input = k.add([
        k.text("..."),
        k.textInput(true), // <- 20 chars at max
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
      ]);

      $(room.state).listen("question", () => {
        question.text = room.state.question;
      })

      input.onUpdate(() => {
        if (input.text == question.text) {
          if (player.sessionId == room.sessionId) {
            k.play("score");
            room.send("scored", player.team);
          }
          input.text = "...";
          input.unuse("textInput");
          input.use(k.textInput(true));
        }
      });
      spritesBySessionId[sessionId] = await createPlayer(room, player);
    });




    // listen when a player is removed from server state
    $(room.state).players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

  });
}

async function createPlayer(room: Room<MyRoomState>, playerState: Player) {
  await k.loadSprite(playerState.avatar, `assets/${playerState.avatar}.png`);
  await k.getSprite(playerState.avatar);
  return k.add(player(room, playerState));
}
