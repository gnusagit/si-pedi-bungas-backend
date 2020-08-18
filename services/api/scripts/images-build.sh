#!/usr/bin/env bash

cd ../

docker build \
	-t si-pedi-bungas-api-service:1.0 \
	.;
