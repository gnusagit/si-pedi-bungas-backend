#!/usr/bin/env bash

docker run \
	-d \
	--name "minio2" \
	-p 9001:9001/tcp \
	-p 9001:9001/udp \
	-e "MINIO_ACCESS_KEY=admin" \
	-e "MINIO_SECRET_KEY=admin123" \
	minio/minio server /data;
