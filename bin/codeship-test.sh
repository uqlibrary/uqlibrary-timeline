#!/bin/bash

echo "Testing branch: ${CI_BRANCH}"

# Run local tests
echo "Starting local WCT tests"
bower install
wct