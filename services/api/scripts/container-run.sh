#!/usr/bin/env bash

cd ../

docker run \
	-d \
	--name "si-pedi-bungas_api_service__" \
	-p 10434:8000 \
	-v $(pwd)/server:/usr/src/app/server \
	--link mongodb \
	--link redis \
	si-pedi-bungas-api-service:1.0;
