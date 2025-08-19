import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { GAME_HEIGHT, GAME_WIDTH } from "../../../globals";

// list of avatars
const avatars = ['glady', 'dino', 'bean', 'bag', 'btfly', 'bobo', 'ghostiny', 'ghosty', 'mark'];

const questionList = avatars;

export class MyRoom extends Room {
  maxClients = 2;
  state = new MyRoomState();

  teamPlayersCount(team: "left" | "right" = "left") {
    return [...this.state.players.values()].filter(p => p.team == team).length;
  }

  onCreate(options: any) {
    this.state.question = questionList[Math.floor(Math.random() * questionList.length)];

    this.onMessage("scored", (client, message) => {
      if (message == "left") {
        this.state.leftScore++;
      } else if (message == "right") {
        this.state.rightScore++;
      }

      const pad =
        Math.max(this.state.leftScore, this.state.rightScore).toString().length;

      this.broadcast(
        "score",
        `${String(this.state.leftScore).padStart(pad, "0")}:${String(this.state.rightScore).padStart(pad, "0")
        }`,
      );
      this.state.question = questionList[Math.floor(Math.random() * questionList.length)];
    });

  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.team = this.teamPlayersCount() % 2 ? "right" : "left";

    player.x = player.team == "left" ? GAME_WIDTH / 4 : GAME_WIDTH - (GAME_WIDTH / 4);
    player.y = GAME_HEIGHT / 2;
    player.sessionId = client.sessionId;
    // get a random avatar for the player
    player.avatar = avatars[Math.floor(Math.random() * avatars.length)];

    this.state.players.set(client.sessionId, player);
    reset(this);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
    reset(this);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}

function reset(room: MyRoom) {
  room.state.leftScore = 0;
  room.state.rightScore = 0;

  room.broadcast("score", "0:0")
}