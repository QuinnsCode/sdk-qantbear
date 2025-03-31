"use client";

import { useState, useEffect } from "react";

export const BigState = ({
    props,
}: {
    props: {
        initialGameState: any;
        gameId: string;
    };
}) => {
    const { gameId, initialGameState } = props;

    const bigState = {
      "0": {
        "name": "Northwestern Oil Emirate",
        "neighbors": ["5", "1", "31"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "1": {
        "name": "Alberta",
        "neighbors": ["0", "5", "6", "8"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "2": {
        "name": "Mexico",
        "neighbors": ["3", "8", "12"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "3": {
        "name": "American Republic",
        "neighbors": ["6", "7", "50", "2", "8"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "4": {
        "name": "Exiled States of America",
        "neighbors": ["5", "7", "14"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "5": {
        "name": "Nunavut",
        "neighbors": ["0", "1", "6", "4"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "6": {
        "name": "Canada",
        "neighbors": ["5", "7", "3", "8", "1"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "7": {
        "name": "République du Québec",
        "neighbors": ["4", "6", "3"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "8": {
        "name": "Continental Biospheres",
        "neighbors": ["1", "6", "3", "2", "42"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "9": {
        "name": "Argentina",
        "neighbors": ["44", "10", "11"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "10": {
        "name": "Amazon Desert",
        "neighbors": ["12", "49", "24", "48", "9", "11"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "11": {
        "name": "Andean Nations",
        "neighbors": ["12", "10", "9"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "12": {
        "name": "Nuevo Timoto",
        "neighbors": ["2", "10", "11", "44"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "13": {
        "name": "New Avalon",
        "neighbors": ["14", "15", "16", "19", "51"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "14": {
        "name": "Iceland GRC (Genetic Research Center)",
        "neighbors": ["4", "16", "13"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "15": {
        "name": "Warsaw Republic",
        "neighbors": ["16", "18", "17", "19", "13"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "16": {
        "name": "Jotenheim",
        "neighbors": ["18", "15", "13", "14"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "17": {
        "name": "Imperial Balkania",
        "neighbors": ["15", "18", "32", "22", "24", "19"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "18": {
        "name": "Ukrayina",
        "neighbors": ["16", "15", "17", "32", "26", "36"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "19": {
        "name": "Andorra",
        "neighbors": ["14", "15", "17", "24"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "20": {
        "name": "Zaire Military Zone",
        "neighbors": ["24", "21", "25"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "21": {
        "name": "Ministry of Djibouti",
        "neighbors": ["22", "24", "20", "23", "25"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "22": {
        "name": "Egypt",
        "neighbors": ["17", "32", "24", "21"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "23": {
        "name": "Madagascar",
        "neighbors": ["21", "25", "53"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "24": {
        "name": "Saharan Empire",
        "neighbors": ["19", "17", "22", "21", "20", "47", "10"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      
      "25": {
        "name": "Lesotho",
        "neighbors": ["20", "21", "23"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "26": {
        "name": "Afghanistan",
        "neighbors": ["32", "28", "27", "36", "18"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "27": {
        "name": "Hong Kong",
        "neighbors": ["46", "34", "28", "26", "36", "35", "33"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "28": {
        "name": "United Indiastan",
        "neighbors": ["52", "32", "26", "27", "34"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "29": {
        "name": "Alden",
        "neighbors": ["35", "37", "31", "33"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "30": {
        "name": "Japan",
        "neighbors": ["31", "33", "46"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "31": {
        "name": "Pevek",
        "neighbors": ["37", "29", "33", "30", "2"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "32": {
        "name": "Middle East",
        "neighbors": ["18", "17", "22", "26", "28"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "33": {
        "name": "Khan Industrial State",
        "neighbors": ["30", "31", "29", "35", "27"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "34": {
        "name": "Angkhor Wat",
        "neighbors": ["27", "28", "39"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "35": {
        "name": "Siberia",
        "neighbors": ["36", "27", "33", "29", "37"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "36": {
        "name": "Enclave of the Bear",
        "neighbors": ["18", "26", "27", "35"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "37": {
        "name": "Sakha",
        "neighbors": ["35", "29", "31"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "38": {
        "name": "Australian Testing Ground",
        "neighbors": ["41", "40"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "39": {
        "name": "Java Cartel",
        "neighbors": ["34", "45", "40", "41"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "40": {
        "name": "New Guinea",
        "neighbors": ["39", "38", "41"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "41": {
        "name": "Aboriginal League",
        "neighbors": ["54", "39", "38", "40"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "42": {
        "name": "Poseidon",
        "neighbors": ["8", "43"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "43": {
        "name": "Hawaiian Preserve",
        "neighbors": ["42", "44"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "44": {
        "name": "New Atlantis",
        "neighbors": ["43", "12", "46"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "45": {
        "name": "Sung Tzu",
        "neighbors": ["46", "39"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "46": {
        "name": "Neo Tokyo",
        "neighbors": ["30", "27", "45"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "47": {
        "name": "The Ivory Reef",
        "neighbors": ["24", "48"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "48": {
        "name": "Neo Paulo",
        "neighbors": ["47", "10"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "49": {
        "name": "Nova Brasilia",
        "neighbors": ["10", "50"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "50": {
        "name": "New York",
        "neighbors": ["3", "49", "51"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "51": {
        "name": "Western Ireland",
        "neighbors": ["13", "50"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "52": {
        "name": "South Ceylon",
        "neighbors": ["28", "53"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "53": {
        "name": "Microcorp",
        "neighbors": ["52", "54", "23"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      },
      "54": {
        "name": "Akara",
        "neighbors": ["41", "53"],
        "owner": null,
        "ownerUnitCount": 0,
        "attacker": null,
        "attackerUnitCount": 0,
        "hasLeaderDefense": false,
        "hasLeaderOffense": false
      } 
    }

    // State for the game
    const [gameState, setGameState] = useState<any | undefined>(initialGameState);
    const [loading, setLoading] = useState(false);

    return (
        <div>
            <h1>Game: {gameId}</h1>
            <pre>
                {gameState ? JSON.stringify(gameState, null, 2) : 'Loading...'}
            </pre>
        </div>
    );
};