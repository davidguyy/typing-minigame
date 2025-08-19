import type { GameObj, Vec2 } from "kaplay";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";

// Needs room state and player instance for server communication and player data
export default (room: Room<MyRoomState>, player: Player) => ([
    k.sprite(player.avatar, { flipX: player.team == "right" }), // player on the right side will face center
    k.pos(player.x, player.y), // initial pos by server
    k.anchor("center"),
    k.scale(0), // we will scale-in player on spawn
    k.z(player.y), // update Z sorting as well by matching it to Y
    k.animate(),
    "player",
    {
        // Define a bunch of useful properties
        sessionId: player.sessionId,
        team: player.team,
        startPos: k.vec2(player.x, player.y),
        add(this: GameObj) {
            // Scale player in with nice transition once added
            k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutBack);


            // Raytracing :)
            this.add([
                k.anchor("center"),
                k.sprite(player.avatar, { flipX: this.flipX, flipY: true }),
                k.pos(0, k.getSprite(player.avatar)?.data?.height ?? this.height),
                k.opacity(0.2),
            ]);
        },

    },
]);
