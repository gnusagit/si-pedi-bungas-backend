#!/usr/bin/env bash

cd ../

docker run \
	-d \
	--name "si-pedi-bungas_api_public_service__" \
	-p 10435:8000 \
	-v $(pwd)/server:/usr/src/app/server \
	--link mongodb \
	--link redis \
	si-pedi-bungas-api-public-service:1.0;
