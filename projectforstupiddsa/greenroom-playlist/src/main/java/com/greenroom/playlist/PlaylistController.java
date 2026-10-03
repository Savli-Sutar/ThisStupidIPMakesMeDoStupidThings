package com.greenroom.playlist;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/greenroom-api")
public class PlaylistController {
    private final List<Track> tracks = List.of(
        new Track(
            1,
            "House Plants",
            "Mild Orange",
            "Foreword",
            "Ambient",
            247,
            "linear-gradient(140deg,#6d7f39,#d88a62)",
            "For the room after the room has gone quiet."
        ),
        new Track(
            2,
            "I Keep Calling",
            "Nala Sinephro",
            "Endless Space",
            "Jazz",
            321,
            "linear-gradient(140deg,#d07360,#455f42)",
            "A patient pulse with the lights turned low."
        ),
        new Track(
            3,
            "Tangerine Dream",
            "Kadhja Bonet",
            "Childqueen",
            "Soul",
            284,
            "linear-gradient(140deg,#c0a648,#3e6650)",
            "Golden hour, extended past midnight."
        ),
        new Track(
            4,
            "Solitude",
            "Mndsgn",
            "Rare Pleasure",
            "Electronic",
            198,
            "linear-gradient(140deg,#415e74,#bb735f)",
            "A little synthetic, a little human."
        ),
        new Track(
            5,
            "I Want You Around",
            "Snoh Aalegra",
            "Temporary Highs",
            "Soul",
            273,
            "linear-gradient(140deg,#985d4a,#9ca951)",
            "Soft edges for a long walk home."
        ),
        new Track(
            6,
            "Meltwater",
            "Hania Rani",
            "Ghosts",
            "Ambient",
            226,
            "linear-gradient(140deg,#506e61,#907a48)",
            "Piano shadows on a green wall."
        ),
        new Track(
            7,
            "Open Window",
            "Yussef Dayes",
            "Black Classical Music",
            "Jazz",
            302,
            "linear-gradient(140deg,#354e47,#cd7658)",
            "The city breathing through the curtains."
        ),
        new Track(
            8,
            "Night Flight",
            "Logic1000",
            "Mother",
            "Electronic",
            238,
            "linear-gradient(140deg,#476e63,#80614e)",
            "Keep this one for the final stretch."
        )
    );

    @GetMapping("/playlist")
    public Map<String, Object> playlist() {
        return Map.of(
            "name", "After hours, in good company.",
            "subtitle",
            "A hand-picked sequence for the part of the night where conversation softens and the city turns its volume down.",
            "tracks", tracks
        );
    }

    @GetMapping("/healthz")
    public Map<String, String> health() {
        return Map.of(
            "status", "ok",
            "service", "greenroom-java"
        );
    }

    public record Track(
        int id,
        String title,
        String artist,
        String album,
        String genre,
        int duration,
        String color,
        String description
    ) {}
}