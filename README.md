<p align="center"> 
  <br/>
  <a href="https://opensource.org/license/agpl-v3"><img src="https://img.shields.io/badge/License-AGPL_v3-blue.svg?color=3F51B5&style=for-the-badge&label=License&logoColor=000000&labelColor=ececec" alt="License: AGPLv3"></a>
  <a href="https://discord.immich.app">
    <img src="https://img.shields.io/discord/979116623879368755.svg?label=Discord&logo=Discord&style=for-the-badge&logoColor=000000&labelColor=ececec" alt="Discord"/>
  </a>
  <br/>
  <br/>
</p>

<p align="center">
<img src="design/immich-logo-stacked-light.svg" width="300" title="Login With Custom URL">
</p>
<h3 align="center">High performance self-hosted photo and video management solution</h3>
<br/>
<a href="https://immich.app">
<img src="design/immich-screenshots.png" title="Main Screenshot">
</a>
<br/>

<p align="center">
  <a href="readme_i18n/README_ca_ES.md">Català</a>
  <a href="readme_i18n/README_es_ES.md">Español</a>
  <a href="readme_i18n/README_fr_FR.md">Français</a>
  <a href="readme_i18n/README_it_IT.md">Italiano</a>
  <a href="readme_i18n/README_ja_JP.md">日本語</a>
  <a href="readme_i18n/README_ko_KR.md">한국어</a>
  <a href="readme_i18n/README_de_DE.md">Deutsch</a>
  <a href="readme_i18n/README_nl_NL.md">Nederlands</a>
  <a href="readme_i18n/README_tr_TR.md">Türkçe</a>
  <a href="readme_i18n/README_zh_CN.md">中文</a>
  <a href="readme_i18n/README_uk_UA.md">Українська</a>
  <a href="readme_i18n/README_ru_RU.md">Русский</a>
  <a href="readme_i18n/README_pt_BR.md">Português Brasileiro</a>
  <a href="readme_i18n/README_sv_SE.md">Svenska</a>
  <a href="readme_i18n/README_ar_JO.md">العربية</a>
  <a href="readme_i18n/README_vi_VN.md">Tiếng Việt</a>
  <a href="readme_i18n/README_th_TH.md">ภาษาไทย</a>
</p>

## Disclaimer

- ⚠️ The project is under **very active** development.
- ⚠️ Expect bugs and breaking changes.
- ⚠️ **Do not use the app as the only way to store your photos and videos.**
- ⚠️ Always follow [3-2-1](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/) backup plan for your precious photos and videos!

> [!NOTE]
> You can find the main documentation, including installation guides, at https://immich.app/.

## Docker Deployment Guide

This guide will help you deploy this specific fork of Immich on your server using Docker. If you prefer to use the official Immich installation, please refer to the [official documentation](https://immich.app/docs/install/requirements).

### Prerequisites

Before starting, ensure your server has:
- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (to clone this repository)
- At least **4GB RAM** (8GB recommended)
- **10GB+ free disk space** (more depending on your media collection)

### Step-by-Step Deployment

#### 1. Clone This Repository

```bash
git clone https://github.com/Janinnho/immich-viewer.git
cd immich-viewer
```

#### 2. Navigate to Docker Directory

```bash
cd docker
```

#### 3. Create Environment File

Copy the example environment file and customize it:

```bash
cp example.env .env
```

#### 4. Configure Environment Variables

Edit the `.env` file with your preferred settings:

```bash
nano .env
```

**Important settings to customize:**

- `UPLOAD_LOCATION`: Path where your photos/videos will be stored (e.g., `./library`)
- `DB_DATA_LOCATION`: Path where database files will be stored (e.g., `./postgres`)
- `DB_PASSWORD`: Change this to a secure password
- `TZ`: Set your timezone (e.g., `America/New_York`, `Europe/London`)

**Example `.env` configuration:**
```env
# The location where your uploaded files are stored
UPLOAD_LOCATION=./library

# The location where your database files are stored
DB_DATA_LOCATION=./postgres

# Set your timezone
TZ=America/New_York

# The Immich version to use
IMMICH_VERSION=release

# Change this to a secure password
DB_PASSWORD=your_secure_password_here

# The values below typically don't need to be changed
DB_USERNAME=postgres
DB_DATABASE_NAME=immich
```

#### 5. Create Required Directories

```bash
mkdir -p ${UPLOAD_LOCATION:-./library}
mkdir -p ${DB_DATA_LOCATION:-./postgres}
```

#### 6. Start the Services

Launch all Immich services:

```bash
docker compose up -d
```

#### 7. Verify Deployment

Check that all containers are running:

```bash
docker compose ps
```

You should see all services (`immich-server`, `immich-machine-learning`, `redis`, `database`) in "Up" status.

#### 8. Access Your Immich Instance

- **Web Interface**: Open your browser and navigate to `http://your-server-ip:2283`
- **Mobile App**: Use `http://your-server-ip:2283` as the server URL

Replace `your-server-ip` with your actual server's IP address.

### Initial Setup

1. On first access, you'll be prompted to create an admin account
2. Fill in the required information (email, password, name)
3. Start uploading your photos and videos!

### Maintenance Commands

#### View Logs
```bash
# View logs for all services
docker compose logs

# View logs for a specific service
docker compose logs immich-server
docker compose logs immich-machine-learning
```

#### Update Immich
```bash
# Pull latest images and restart
docker compose pull
docker compose up -d
```

#### Stop Services
```bash
docker compose down
```

#### Backup Your Data
It's crucial to backup your data regularly:

```bash
# Stop services
docker compose down

# Backup your upload directory and database
tar -czf immich-backup-$(date +%Y%m%d).tar.gz ./library ./postgres

# Restart services
docker compose up -d
```

### Troubleshooting

#### Common Issues

**Port 2283 already in use:**
- Change the port mapping in `docker-compose.yml`: `ports: - '3001:2283'`
- Access via `http://your-server-ip:3001`

**Permission issues:**
```bash
# Fix ownership of data directories
sudo chown -R $USER:$USER ./library ./postgres
```

**Database connection issues:**
- Ensure `DB_PASSWORD` in `.env` matches between all services
- Check that the database container is healthy: `docker compose ps`

**Out of memory:**
- Ensure your server has sufficient RAM
- Consider adding swap space if running on a low-memory system

#### Container Health Checks
```bash
# Check container health
docker compose ps

# Check specific container logs
docker logs immich_server
docker logs immich_postgres
```

### Hardware Acceleration (Optional)

For better performance, you can enable hardware acceleration:

1. **GPU Acceleration**: Uncomment the relevant sections in `docker-compose.yml`
2. **CPU Optimization**: Adjust the `hwaccel` settings based on your hardware

Refer to the [ML Hardware Acceleration guide](https://immich.app/docs/features/ml-hardware-acceleration) for detailed configuration.

### Security Considerations

- **Change default passwords**: Always use strong, unique passwords
- **Firewall**: Consider restricting access to port 2283 to trusted networks
- **HTTPS**: For production use, consider setting up a reverse proxy with SSL/TLS
- **Regular updates**: Keep Immich and Docker updated for security patches

### Advanced Configuration

For advanced configurations such as:
- Custom storage locations
- External databases
- Reverse proxy setup
- Scaling for multiple users

Please refer to the [official Immich documentation](https://immich.app/docs).

## Links

- [Documentation](https://immich.app/docs)
- [About](https://immich.app/docs/overview/introduction)
- [Installation](https://immich.app/docs/install/requirements)
- [Roadmap](https://immich.app/roadmap)
- [Demo](#demo)
- [Features](#features)
- [Translations](https://immich.app/docs/developer/translations)
- [Contributing](https://immich.app/docs/overview/support-the-project)

## Demo

Access the demo [here](https://demo.immich.app). For the mobile app, you can use `https://demo.immich.app` for the `Server Endpoint URL`.

### Login credentials

| Email           | Password |
| --------------- | -------- |
| demo@immich.app | demo     |

## Features

| Features                                     | Mobile | Web |
| :------------------------------------------- | ------ | --- |
| Upload and view videos and photos            | Yes    | Yes |
| Auto backup when the app is opened           | Yes    | N/A |
| Prevent duplication of assets                | Yes    | Yes |
| Selective album(s) for backup                | Yes    | N/A |
| Download photos and videos to local device   | Yes    | Yes |
| Multi-user support                           | Yes    | Yes |
| Album and Shared albums                      | Yes    | Yes |
| Scrubbable/draggable scrollbar               | Yes    | Yes |
| Support raw formats                          | Yes    | Yes |
| Metadata view (EXIF, map)                    | Yes    | Yes |
| Search by metadata, objects, faces, and CLIP | Yes    | Yes |
| Administrative functions (user management)   | No     | Yes |
| Background backup                            | Yes    | N/A |
| Virtual scroll                               | Yes    | Yes |
| OAuth support                                | Yes    | Yes |
| API Keys                                     | N/A    | Yes |
| LivePhoto/MotionPhoto backup and playback    | Yes    | Yes |
| Support 360 degree image display             | No     | Yes |
| User-defined storage structure               | Yes    | Yes |
| Public Sharing                               | Yes    | Yes |
| Archive and Favorites                        | Yes    | Yes |
| Global Map                                   | Yes    | Yes |
| Partner Sharing                              | Yes    | Yes |
| Facial recognition and clustering            | Yes    | Yes |
| Memories (x years ago)                       | Yes    | Yes |
| Offline support                              | Yes    | No  |
| Read-only gallery                            | Yes    | Yes |
| Stacked Photos                               | Yes    | Yes |
| Tags                                         | No     | Yes |
| Folder View                                  | Yes    | Yes |

## Translations

Read more about translations [here](https://immich.app/docs/developer/translations).

<a href="https://hosted.weblate.org/engage/immich/">
<img src="https://hosted.weblate.org/widget/immich/immich/multi-auto.svg" alt="Translation status" />
</a>

## Repository activity

![Activities](https://repobeats.axiom.co/api/embed/9e86d9dc3ddd137161f2f6d2e758d7863b1789cb.svg "Repobeats analytics image")

## Star history

<a href="https://star-history.com/#immich-app/immich&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=immich-app/immich&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=immich-app/immich&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=immich-app/immich&type=Date" width="100%" />
 </picture>
</a>

## Contributors

<a href="https://github.com/alextran1502/immich/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=immich-app/immich" width="100%"/>
</a>
