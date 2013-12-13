#!/bin/bash

INFILE="app/locale/en-en.json"
OUTFILE="app/_locales/en/messages.json"

while read line; do
    echo $line | awk -F: '{ print $1 ": \{\n"  "  message: " $2 "\n  description: \"\"\n\}\,\n" }' >> $OUTFILE
done < $INFILE