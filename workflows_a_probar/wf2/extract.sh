#!/bin/bash

names=("Juan" "Maria" "Luis" "Ana" "Carlos" "Elena" "Diego" "Sofia" "Jose" "Laura")
lastnames=("Perez" "Garcia" "Torres" "Ruiz" "Lopez" "Sanchez" "Gomez" "Diaz")
careers=("Sistemas" "Industrial" "Civil")

# Inicio del objeto global
echo "{"
echo "  \"rawData\": ["

for i in {1..100}
do
    code=$((1000 + i))
    name="${names[$RANDOM % ${#names[@]}]} ${lastnames[$RANDOM % ${#lastnames[@]}]}"
    career="${careers[$RANDOM % ${#careers[@]}]}"
    grade=$((RANDOM % 11 + 10))
    
    echo "    {"
    echo "      \"codigo\": $code,"
    echo "      \"nombre\": \"$name\","
    echo "      \"carrera\": \"$career\","
    echo "      \"nota\": $grade"
    
    if [ $i -lt 100 ]; then
        echo "    },"
    else
        echo "    }"
    fi
done

echo "  ]"
echo "}"
