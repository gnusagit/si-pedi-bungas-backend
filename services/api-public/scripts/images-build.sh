#!/usr/bin/env bash

cd ../

docker build \
	-t si-pedi-bungas-api-public-service:1.0 \
	.;
