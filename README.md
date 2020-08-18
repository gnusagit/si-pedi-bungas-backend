# si-pedi-bungas by Gnusa

## Installation

Gunakan docker untuk menjalankan service ```database(mongodb)```, ```minio```, ```redis``` dan ```API```

Cara install docker, [Klik Disini](https://docs.docker.com/get-docker/)

Jalankan `Database(mongodb)`, `Minio` & `redis` (Apabila belum pernah menjalankan sebelumnya sama sekali)

## MongoDB
```bash
cd /services/mongodb
sh container-run.sh
```

### Minio
```bash
cd /services/minio
sh container-run.sh
```

### Redis
```bash
cd /services/minio
sh container-run.sh
```
### API
- Ubah nama file ```/services/api/environment.txt``` => ```/services/api/.env```
- Sesuaikan konfigurasi environment API dengan lokal PC anda
- Jalankan perintah dibawah
```bash
cd /services/api/scripts
sh images-build.sh
sh container-run.sh
```

### Webix
- Ubah nama file ```/webix/babelrc.txt``` => ```/webix/.babelrc```
- Jalankan perintah dibawah
```bash
cd /webix/
npm install
```
- Run ```npm run start``` ~ Development mode
- Run ```npm run build``` ~ Production mode
- open ```http://103.85.13.5/si-pedi-bungas```

### nginx
Port forwarding
```
location /si-pedi-bungas/ {
    proxy_pass http://127.0.0.1:10433/;
}

location /si-pedi-bungas-server {
    proxy_pass http://127.0.0.1:10434;
}
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
