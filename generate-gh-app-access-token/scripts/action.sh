#!/usr/bin/bash

set -euo pipefail

APP_ID=$1
APP_INSTALLATION_ID=$2
PRIVATE_KEY=$3

generateJWT() {
    APP_ID=$1
    PRIVATE_KEY=$2

    # https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
    # https://stackoverflow.com/a/62646786
    NOW=$(date +%s)
    IAT="${NOW}"
    # expire 9 minutes in the future. 10 minutes is the max for github
    EXP=$((${NOW} + 540))
    HEADER_RAW='{"alg":"RS256"}'
    HEADER=$(echo -n "${HEADER_RAW}" | openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

    PAYLOAD_RAW='{"iat":'"${IAT}"',"exp":'"${EXP}"',"iss":'"${APP_ID}"'}'
    PAYLOAD=$(echo -n "${PAYLOAD_RAW}" | openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

    HEADER_PAYLOAD="${HEADER}"."${PAYLOAD}"
    SIGNATURE=$( openssl dgst -sha256 -sign <(echo -n "${PRIVATE_KEY}") <(echo -n "${HEADER_PAYLOAD}") | openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n' )
    
    echo "$HEADER_PAYLOAD.$SIGNATURE"
}

generateAccessToken() {
    # https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app

    APP_INSTALLATION_ID=$1
    JWT=$2

    API_URL="https://api.github.com"
    ENDPOINT="$API_URL/app/installations/$APP_INSTALLATION_ID/access_tokens"
    TOKEN=$(curl --fail --silent -X POST -H "Authorization: Bearer ${JWT}" -H "Accept: application/vnd.github.v3+json" "$ENDPOINT" | jq -r .token)
    echo "$TOKEN"
}

# Run
JWT=$(generateJWT "$APP_ID" "$PRIVATE_KEY")
ACCESS_TOKEN=$(generateAccessToken "$APP_INSTALLATION_ID" "$JWT")

echo "::add-mask::$JWT"
echo "::add-mask::$ACCESS_TOKEN"

echo "jwt=$JWT" >> $GITHUB_OUTPUT
echo "access-token=$ACCESS_TOKEN" >> $GITHUB_OUTPUT