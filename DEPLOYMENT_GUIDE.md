# Deployment Guide - React + Laravel API

## Architecture Overview

```
┌──────────────────────────────────────────┐
│         CLOUDFLARE PAGES / VERCEL        │
│         React SPA (Static Build)         │
│         Domain: yoursite.com             │
└──────────────────┬───────────────────────┘
                   │ API Calls
                   ↓
┌──────────────────────────────────────────┐
│         LARAVEL API SERVER               │
│         Domain: api.yoursite.com         │
│         (DigitalOcean/Forge/AWS)         │
└──────────────────┬───────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────┐
│         MySQL DATABASE                    │
│         (Same server as Laravel)          │
└──────────────────────────────────────────┘
```

## Option 1: Cloudflare Pages (RECOMMENDED - FREE & FAST)

### Why Cloudflare Pages?
- ✅ **FREE** - Unlimited bandwidth
- ✅ **Global CDN** - 275+ data centers worldwide
- ✅ **Blazing Fast** - Sub-100ms response times
- ✅ **Auto SSL** - Free HTTPS certificates
- ✅ **Edge caching** - Assets cached globally
- ✅ **HTTP/3** - Latest protocol support
- ✅ **Auto deploys** - Connect to GitHub

### Steps:

1. **Build your project:**
```bash
npm run build
# Creates /dist folder
```

2. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/aura-aesthetics.git
git push -u origin main
```

3. **Deploy to Cloudflare Pages:**
- Go to https://pages.cloudflare.com
- Sign up/Login (free)
- Click "Create a project"
- Connect GitHub repository
- Build settings:
  - **Build command:** `npm run build`
  - **Build output directory:** `dist`
  - **Root directory:** (leave empty)
- Environment variables:
  - `VITE_API_URL` = `https://api.yoursite.com`
- Click "Save and Deploy"

4. **Custom Domain (Optional):**
- In Cloudflare Pages > Custom domains
- Add your domain (e.g., aura-aesthetics.com)
- Update DNS settings as shown

**Deployment time: ~5 minutes**  
**Build time: ~1-2 minutes**  
**Global availability: ~30 seconds**

---

## Option 2: Vercel (Also Great, FREE)

### Steps:

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
# Follow prompts
```

3. **Set Environment Variables:**
```bash
vercel env add VITE_API_URL production
# Enter: https://api.yoursite.com
```

4. **Production Deploy:**
```bash
vercel --prod
```

**Your site will be live at:** `https://your-project.vercel.app`

---

## Laravel API Setup

### Option A: Laravel Forge (Easiest - $12/month)

1. Sign up at https://forge.laravel.com
2. Connect your server (DigitalOcean droplet recommended)
3. Create new site: `api.yoursite.com`
4. Deploy your Laravel code via Git
5. Forge handles:
   - Nginx configuration
   - SSL certificates
   - Database setup
   - Queue workers
   - Scheduled tasks

### Option B: Manual Server Setup (DigitalOcean)

**1. Create Server:**
- Go to DigitalOcean
- Create Droplet (Ubuntu 22.04)
- Size: $6/month (sufficient for small site)

**2. Initial Server Setup:**
```bash
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install PHP 8.2
apt install software-properties-common -y
add-apt-repository ppa:ondrej/php -y
apt update
apt install php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml php8.2-curl -y

# Install Nginx
apt install nginx -y

# Install MySQL
apt install mysql-server -y
mysql_secure_installation

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js (for building assets)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y
```

**3. Setup Laravel Project:**
```bash
# Create directory
mkdir -p /var/www/api.yoursite.com
cd /var/www/api.yoursite.com

# Clone your Laravel project
git clone https://github.com/yourusername/aura-api.git .

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install && npm run build

# Set permissions
chown -R www-data:www-data /var/www/api.yoursite.com
chmod -R 755 /var/www/api.yoursite.com/storage

# Setup .env
cp .env.example .env
php artisan key:generate
nano .env  # Edit database credentials
```

**4. Configure Nginx:**
```bash
nano /etc/nginx/sites-available/api.yoursite.com
```

Add:
```nginx
server {
    listen 80;
    server_name api.yoursite.com;
    root /var/www/api.yoursite.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**5. Enable Site:**
```bash
ln -s /etc/nginx/sites-available/api.yoursite.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**6. SSL Certificate:**
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.yoursite.com
```

**7. Setup Database:**
```bash
mysql -u root -p

CREATE DATABASE aura_aesthetics;
CREATE USER 'aura_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON aura_aesthetics.* TO 'aura_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env with database credentials
php artisan migrate
php artisan db:seed  # If you have seeders
```

---

## Laravel Project Structure

### Minimal API Setup:

```bash
# Create new Laravel project
composer create-project laravel/laravel aura-api
cd aura-api

# Install API support
php artisan install:api

# Create controllers
php artisan make:controller Api/ServiceController
php artisan make:controller Api/BookingController
php artisan make:controller Api/ContactController

# Create models
php artisan make:model Service -m
php artisan make:model Booking -m
php artisan make:model Contact -m
```

### routes/api.php:
```php
<?php

use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);

Route::post('/bookings', [BookingController::class, 'store']);

Route::post('/contact', [ContactController::class, 'store']);
```

### app/Http/Controllers/Api/ServiceController.php:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::all();
    }

    public function show($id)
    {
        return Service::findOrFail($id);
    }
}
```

### CORS Setup (config/cors.php):
```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://yoursite.com',
        'https://www.yoursite.com',
        'http://localhost:5173', // For development
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

---

## Performance Testing

After deployment, test your site:

### 1. Google PageSpeed Insights:
https://pagespeed.web.dev/

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### 2. GTmetrix:
https://gtmetrix.com/

**Target:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 3. WebPageTest:
https://www.webpagetest.org/

**Target:**
- First Byte Time: < 600ms
- Start Render: < 1.5s
- Fully Loaded: < 3s

---

## Cost Breakdown

### Free Tier (Suitable for small traffic):
- **Frontend (Cloudflare Pages):** $0/month
- **Backend (Shared hosting):** $5-10/month
- **Database:** Included with hosting
- **Total:** $5-10/month

### Production Ready (Recommended):
- **Frontend (Cloudflare Pages):** $0/month
- **Backend (DigitalOcean Droplet):** $6/month
- **Database:** Included
- **Laravel Forge (optional):** $12/month
- **Total:** $6-18/month

### High Traffic (1000+ daily visitors):
- **Frontend (Cloudflare Pages):** $0/month
- **Backend (DigitalOcean Droplet):** $24/month (4GB RAM)
- **Database:** Included
- **CDN:** Included (Cloudflare)
- **Laravel Forge:** $12/month
- **Total:** $36/month

---

## Monitoring & Maintenance

### Free Monitoring Tools:
1. **UptimeRobot** - Monitor uptime
2. **Google Analytics** - Track visitors
3. **Sentry** - Error tracking
4. **New Relic** (free tier) - Performance monitoring

### Backup Strategy:
```bash
# Daily database backup (add to crontab)
0 2 * * * mysqldump -u aura_user -p'password' aura_aesthetics > /backups/db_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 tar -czf /backups/full_$(date +\%Y\%m\%d).tar.gz /var/www/api.yoursite.com
```

---

## Quick Deployment Checklist

- [ ] Build React app locally (`npm run build`)
- [ ] Test build locally (`npm run preview`)
- [ ] Push to GitHub
- [ ] Deploy to Cloudflare Pages/Vercel
- [ ] Set environment variables
- [ ] Test frontend production URL
- [ ] Setup Laravel project on server
- [ ] Configure Nginx/Apache
- [ ] Setup SSL certificate
- [ ] Configure CORS
- [ ] Run migrations
- [ ] Test API endpoints
- [ ] Update React API URL in environment
- [ ] Test full integration
- [ ] Run performance tests
- [ ] Setup monitoring
- [ ] Configure backups

---

## Troubleshooting

### Issue: Slow API responses
**Solution:**
- Enable OPcache in PHP
- Use Redis for caching
- Index database properly
- Use Laravel query optimization

### Issue: Images loading slowly
**Solution:**
- Compress all images
- Use WebP format
- Implement lazy loading
- Use CDN for images

### Issue: CORS errors
**Solution:**
- Check `config/cors.php`
- Verify allowed origins
- Clear Laravel config cache: `php artisan config:clear`

### Issue: White screen after deployment
**Solution:**
- Check browser console for errors
- Verify API URL in environment variables
- Check network tab for failed requests
- Verify base URL in production build
