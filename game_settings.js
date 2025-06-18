//     "capture_against_walls"
//     "simple_king_capture"
//     "weaponless_king"
//     "hostile_throne"
//     "walk_on_goals"
//     "win_on_edge"


const rulesDescriptions = {
    "capture_against_walls": "Capture opponents by trapping them against a wall.",
    "advanced_king_capture": "Capture the king by trapping it both horizontally AND vertically.",
    "weaponless_king": "Attackers cannot be trapped against the king.",
    "hostile_throne": "When unoccupied by the king, any piece may be captured against the throne and corners."
}

const boards = {
    'hnefatafl': {
        "board_size": "11",
        "tile_map": {
            "A": "tile",
            "B": "throne",
            "C": "goal",
        },
        "piece_map": {
            "O": null,
            "A": "attacker-pawn",
            "D": "defender-pawn",
            "K": "defender-king",
        },
        "tile_layout": [
            ["C", "A", "A", "A", "A", "A", "A", "A", "A", "A", "C"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "B", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["C", "A", "A", "A", "A", "A", "A", "A", "A", "A", "C"],
        ],

        "pieces_layout": [
            ["O", "O", "O", "A", "A", "A", "A", "A", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "A", "O", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
            ["A", "O", "O", "O", "O", "D", "O", "O", "O", "O", "A"],
            ["A", "O", "O", "O", "D", "D", "D", "O", "O", "O", "A"],
            ["A", "A", "O", "D", "D", "K", "D", "D", "O", "A", "A"],
            ["A", "O", "O", "O", "D", "D", "D", "O", "O", "O", "A"],
            ["A", "O", "O", "O", "O", "D", "O", "O", "O", "O", "A"],
            ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "A", "O", "O", "O", "O", "O"],
            ["O", "O", "O", "A", "A", "A", "A", "A", "O", "O", "O"],
        ],

        "rules": [
            "capture_against_walls",
            "simple_king_capture",
            "weaponless_king"
        ]
    },

    'tablut': {
        "board_size": "9",
        "tile_map": {
            "A": "tile",
            "B": "throne",
            "C": "goal",
        },
        "piece_map": {
            "O": null,
            "A": "attacker-pawn",
            "D": "defender-pawn",
            "K": "defender-king",
        },
        "tile_layout": [
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "B", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A"],
        ],

        "pieces_layout": [
            ["O", "O", "O", "A", "A", "A", "O", "O", "O"],
            ["O", "O", "O", "O", "A", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "D", "O", "O", "O", "O"],
            ["A", "O", "O", "O", "D", "O", "O", "O", "A"],
            ["A", "A", "D", "D", "K", "D", "D", "A", "A"],
            ["A", "O", "O", "O", "D", "O", "O", "O", "A"],
            ["O", "O", "O", "O", "D", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "A", "O", "O", "O", "O"],
            ["O", "O", "O", "A", "A", "A", "O", "O", "O"],
        ],

        "rules": [
            "win_on_edge",
            "hostile_throne",
        ]
    },

    'demo': {
        "board_size": "11",
        "tile_map": {
            "A": "tile",
            "B": "throne",
            "C": "goal",
        },
        "piece_map": {
            "O": null,
            "A": "attacker-pawn",
            "D": "defender-pawn",
            "K": "defender-king",
        },
        "tile_layout": [
            ["C", "A", "A", "A", "A", "A", "A", "A", "A", "A", "C"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "B", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A"],
            ["C", "A", "A", "A", "A", "A", "A", "A", "A", "A", "C"],
        ],

        "pieces_layout": [
            ["O", "O", "O", "A", "A", "A", "A", "A", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "A", "O", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
            ["A", "O", "O", "O", "O", "O", "O", "O", "O", "O", "A"],
            ["A", "O", "O", "O", "O", "O", "O", "O", "O", "O", "A"],
            ["A", "A", "O", "O", "O", "K", "O", "O", "O", "A", "A"],
            ["A", "O", "O", "O", "O", "O", "O", "O", "O", "O", "A"],
            ["A", "O", "O", "O", "O", "O", "O", "O", "O", "O", "A"],
            ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O"],
            ["O", "O", "O", "O", "O", "A", "O", "O", "O", "D", "O"],
            ["O", "O", "O", "A", "A", "A", "A", "A", "O", "O", "O"],
        ],

        "rules": [
            "hostile_throne",
            "weaponless_king",
        ]
    },

}